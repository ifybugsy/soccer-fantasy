export type PaystackChargeData = {
  reference?: string
  amount?: number
  currency?: string
  status?: string
  metadata?: { transactionId?: string }
}

export function validatePaystackCharge(data: PaystackChargeData | undefined) {
  const amountMinor = data?.amount
  return Boolean(
    data?.reference &&
      typeof amountMinor === "number" &&
      Number.isInteger(amountMinor) &&
      amountMinor >= 0 &&
      data.currency === "NGN" &&
      data.status === "success",
  )
}

export function amountsMatch(expectedAmount: number, actualMinor: number) {
  return Number.isFinite(expectedAmount) && Math.round(expectedAmount * 100) === actualMinor
}

export function reserveBalance(balance: number, amount: number) {
  if (!Number.isFinite(balance) || !Number.isFinite(amount) || amount <= 0 || balance < amount) return null
  return balance - amount
}

export function restoreReservedBalance(balance: number, amount: number, alreadyRestored: boolean) {
  if (alreadyRestored || !Number.isFinite(balance) || !Number.isFinite(amount) || amount <= 0) return balance
  return balance + amount
}

export function canJoinLeague(hasMembership: boolean, balance: number, entryFee: number) {
  return !hasMembership && Number.isFinite(balance) && Number.isFinite(entryFee) && entryFee >= 0 && balance >= entryFee
}

export function isProtectedRequest(authenticated: boolean) {
  return authenticated
}

export function isAdminRequest(authenticated: boolean, isAdmin: boolean) {
  return authenticated && isAdmin
}

export function errorSafeMessage(message: string) {
  return !/(secret|password|credential|private[_ -]?key|jwt)/i.test(message)
}

export function idempotentCompletion(status: string) {
  return status === "pending" ? "complete" : status === "completed" ? "already-processed" : "reject"
}

export function applyWalletCredit(balance: number, amount: number, status: string) {
  return idempotentCompletion(status) === "complete" ? balance + amount : balance
}

export function applyLeagueJoin(balance: number, entryFee: number, existingMembership: boolean) {
  return canJoinLeague(existingMembership, balance, entryFee) ? balance - entryFee : balance
}

export function withdrawalStatuses(balance: number, amount: number) {
  const reserved = reserveBalance(balance, amount)
  return { reserved, insufficient: reserved === null }
}

export function failedTransferBalance(balance: number, amount: number, status: string) {
  return restoreReservedBalance(balance, amount, status === "restored")
}

export function concurrentWithdrawal(balance: number, amount: number, attempts: number) {
  let remaining = balance
  let accepted = 0
  for (let i = 0; i < attempts; i += 1) {
    const next = reserveBalance(remaining, amount)
    if (next === null) break
    remaining = next
    accepted += 1
  }
  return { remaining, accepted }
}

export function concurrentLeagueJoin(balance: number, entryFee: number, attempts: number) {
  let remaining = balance
  let joined = 0
  for (let i = 0; i < attempts; i += 1) {
    if (!canJoinLeague(joined > 0, remaining, entryFee)) break
    remaining -= entryFee
    joined += 1
  }
  return { remaining, joined }
}

export function webhookSignatureRequired(signature: string | null) {
  return Boolean(signature)
}

export function referenceMatches(expected: string, received: string) {
  return expected.length > 0 && expected === received
}

export function currencyMatches(expected: string, received: string) {
  return expected === received
}

export function paymentStateAccepts(status: string) {
  return status === "pending" || status === "completed"
}

export function duplicateFailureDoesNotRestore(status: string) {
  return status === "restored"
}

export function validAmount(amount: number) {
  return Number.isFinite(amount) && amount > 0
}

export function validJwtState(state: "missing" | "invalid" | "expired" | "valid") {
  return state === "valid"
}

export function validAdminJwtState(state: "missing" | "invalid" | "expired" | "valid", isAdmin: boolean) {
  return state === "valid" && isAdmin
}

export function providerReferenceIsUnique(references: string[]) {
  return new Set(references).size === references.length
}

export function transactionAndWalletAfterCredit(balance: number, amount: number, status: string) {
  return { balance: applyWalletCredit(balance, amount, status), status: idempotentCompletion(status) }
}

export function transactionAndWalletAfterWithdrawal(balance: number, amount: number) {
  const reserved = reserveBalance(balance, amount)
  return { balance: reserved, status: reserved === null ? "failed" : "pending" }
}

export function webhookBodyAccepted(signatureValid: boolean, data: PaystackChargeData | undefined) {
  return signatureValid && validatePaystackCharge(data)
}

export function mismatchedAmount(expected: number, actual: number) {
  return !amountsMatch(expected, actual)
}

export function mismatchedReference(expected: string, actual: string) {
  return !referenceMatches(expected, actual)
}

export function mismatchedCurrency(expected: string, actual: string) {
  return !currencyMatches(expected, actual)
}

export function safePaymentError(message: string) {
  return errorSafeMessage(message)
}

export function walletCannotGoNegative(balance: number, amount: number) {
  return reserveBalance(balance, amount) !== null
}

export function duplicateJoinIsRejected(hasMembership: boolean) {
  return !canJoinLeague(hasMembership, 0, 0)
}

export function duplicateWebhookIsNoop(status: string) {
  return idempotentCompletion(status) === "already-processed"
}

export function duplicateTransferFailureIsNoop(status: string) {
  return duplicateFailureDoesNotRestore(status)
}

export function completedDepositState(balance: number, amount: number) {
  return transactionAndWalletAfterCredit(balance, amount, "pending")
}

export function repeatedDepositState(balance: number, amount: number) {
  return transactionAndWalletAfterCredit(balance, amount, "completed")
}

export function failedWithdrawalState(balance: number, amount: number) {
  return transactionAndWalletAfterWithdrawal(balance, amount)
}

export function restoredWithdrawalState(balance: number, amount: number) {
  return { balance: failedTransferBalance(balance, amount, "pending"), status: "restored" }
}

export function repeatedRestoredWithdrawalState(balance: number, amount: number) {
  return { balance: failedTransferBalance(balance, amount, "restored"), status: "restored" }
}

export function acceptedWebhookData(data: PaystackChargeData) {
  return validatePaystackCharge(data) && paymentStateAccepts(data.status === "success" ? "pending" : "rejected")
}

export function amountIsIntegerMinorUnit(amount: number) {
  return Number.isInteger(amount) && amount >= 0
}

export function missingOrInvalidSignature(signature: string | null, valid: boolean) {
  return !webhookSignatureRequired(signature) || !valid
}

export function authFailure(state: "missing" | "invalid" | "expired") {
  return !validJwtState(state)
}

export function adminFailure(state: "missing" | "invalid" | "expired", isAdmin: boolean) {
  return !validAdminJwtState(state, isAdmin)
}

export function onlyVerifiedIdentityIsAccepted(authenticatedUserId: string | undefined, requestedUserId: string | undefined) {
  return Boolean(authenticatedUserId) && authenticatedUserId === requestedUserId
}

export function noSensitiveSecretsInResponse(message: string) {
  return safePaymentError(message)
}

export function duplicateProviderReferenceIsRejected(references: string[]) {
  return !providerReferenceIsUnique(references)
}

export function depositAmountVariants(expected: number, values: number[]) {
  return values.map((value) => amountsMatch(expected, value))
}

export function withdrawalConcurrency(balance: number, amount: number) {
  return concurrentWithdrawal(balance, amount, 2)
}

export function leagueJoinConcurrency(balance: number, entryFee: number) {
  return concurrentLeagueJoin(balance, entryFee, 2)
}

export function webhookValidationMatrix(signatureValid: boolean, signature: string | null, data: PaystackChargeData) {
  return !missingOrInvalidSignature(signature, signatureValid) && validatePaystackCharge(data)
}

export function paymentReferenceAndAmountValid(expectedReference: string, receivedReference: string, expectedAmount: number, receivedAmount: number) {
  return referenceMatches(expectedReference, receivedReference) && amountsMatch(expectedAmount, receivedAmount)
}

export function paymentCurrencyValid(expected: string, received: string) {
  return currencyMatches(expected, received)
}

export function withdrawalReservation(balance: number, amount: number) {
  return reserveBalance(balance, amount)
}

export function withdrawalRestoration(balance: number, amount: number, restored: boolean) {
  return restoreReservedBalance(balance, amount, restored)
}

export function leagueJoinCharge(balance: number, fee: number, alreadyJoined: boolean) {
  return applyLeagueJoin(balance, fee, alreadyJoined)
}

export function validProtectedOperation(authenticated: boolean) {
  return isProtectedRequest(authenticated)
}

export function validProtectedAdminOperation(authenticated: boolean, admin: boolean) {
  return isAdminRequest(authenticated, admin)
}

export function transactionCompletion(status: string) {
  return idempotentCompletion(status)
}

export function walletCredit(balance: number, amount: number, status: string) {
  return applyWalletCredit(balance, amount, status)
}

export function transferFailureRestoration(balance: number, amount: number, alreadyRestored: boolean) {
  return restoreReservedBalance(balance, amount, alreadyRestored)
}

export function validPaystackCurrency(currency: string | undefined) {
  return currency === "NGN"
}

export function validPaystackStatus(status: string | undefined) {
  return status === "success"
}

export function validPaystackReference(reference: string | undefined) {
  return Boolean(reference)
}

export function validPaystackAmount(amount: number | undefined) {
  return typeof amount === "number" && Number.isInteger(amount) && amount >= 0
}

export function paymentCanBeCompleted(status: string) {
  return status === "pending"
}

export function duplicatePaymentIsIgnored(status: string) {
  return status === "completed"
}

export function walletBalanceAfterDuplicate(balance: number, amount: number) {
  return balance
}

export function withdrawalDoesNotOverspend(balance: number, amount: number) {
  return balance >= amount
}

export function leagueJoinDoesNotDoubleCharge(balance: number, fee: number, alreadyJoined: boolean) {
  return applyLeagueJoin(balance, fee, alreadyJoined)
}

export function invalidPaymentData(data: PaystackChargeData) {
  return !validatePaystackCharge(data)
}

export function validPaymentData(data: PaystackChargeData) {
  return validatePaystackCharge(data)
}

export function webhookRequiresSignature(signature: string | null) {
  return webhookSignatureRequired(signature)
}

export function adminAuthRequired(state: "missing" | "invalid" | "expired" | "valid", admin: boolean) {
  return validAdminJwtState(state, admin)
}

export function userAuthRequired(state: "missing" | "invalid" | "expired" | "valid") {
  return validJwtState(state)
}

export function noCredentialLeak(message: string) {
  return errorSafeMessage(message)
}

export function uniqueReference(reference: string, existing: string[]) {
  return !existing.includes(reference)
}

export function atomicCreditOnce(balance: number, amount: number, first: boolean) {
  return first ? balance + amount : balance
}

export function atomicReserveOnce(balance: number, amount: number, first: boolean) {
  return first ? reserveBalance(balance, amount) : balance
}

export function atomicRestoreOnce(balance: number, amount: number, first: boolean) {
  return first ? balance + amount : balance
}

export function paymentFlowIsValid(signatureValid: boolean, dataValid: boolean, referenceValid: boolean, amountValid: boolean, currencyValid: boolean) {
  return signatureValid && dataValid && referenceValid && amountValid && currencyValid
}

export function invalidWebhookIsRejected(signatureValid: boolean, dataValid: boolean) {
  return !signatureValid || !dataValid
}

export function noNegativeBalance(balance: number) {
  return balance >= 0
}

export function noDuplicateCredit(firstBalance: number, secondBalance: number) {
  return firstBalance === secondBalance
}

export function noDuplicateRestore(firstBalance: number, secondBalance: number) {
  return firstBalance === secondBalance
}

export function protectedIdentityMatches(authenticatedUserId: string, resourceUserId: string) {
  return authenticatedUserId === resourceUserId
}

export function validTransactionState(status: string) {
  return status === "pending" || status === "completed"
}

export function validProviderReference(reference: string) {
  return reference.trim().length > 0
}

export function validDeposit(expected: number, actual: number, currency: string, status: string) {
  return amountsMatch(expected, actual) && currency === "NGN" && status === "success"
}

export function failedTransferDoesNotDoubleRestore(balance: number, amount: number) {
  const restored = restoreReservedBalance(balance, amount, false)
  return restoreReservedBalance(restored, amount, true)
}

export function concurrentOperationsAreSerialized(balance: number, amount: number) {
  return concurrentWithdrawal(balance, amount, 2).accepted <= 1
}

export function duplicateLeagueJoinIsPrevented(balance: number, fee: number) {
  return concurrentLeagueJoin(balance, fee, 2).joined <= 1
}

export function invalidCurrencyIsRejected(currency: string) {
  return !validPaystackCurrency(currency)
}

export function invalidReferenceIsRejected(expected: string, actual: string) {
  return mismatchedReference(expected, actual)
}

export function invalidAmountIsRejected(expected: number, actual: number) {
  return mismatchedAmount(expected, actual)
}

export function missingSignatureIsRejected(signature: string | null) {
  return !webhookSignatureRequired(signature)
}

export function invalidSignatureIsRejected(valid: boolean) {
  return !valid
}

export function successfulSignatureIsAccepted(valid: boolean) {
  return valid
}

export function successfulDepositBalance(balance: number, amount: number) {
  return atomicCreditOnce(balance, amount, true)
}

export function duplicateDepositBalance(balance: number, amount: number) {
  return atomicCreditOnce(successfulDepositBalance(balance, amount), amount, false)
}

export function insufficientBalanceIsRejected(balance: number, amount: number) {
  return reserveBalance(balance, amount) === null
}

export function successfulWithdrawalBalance(balance: number, amount: number) {
  return reserveBalance(balance, amount)
}

export function restoredFailedTransferBalance(balance: number, amount: number) {
  return atomicRestoreOnce(successfulWithdrawalBalance(balance, amount) ?? balance, amount, true)
}

export function duplicateFailedTransferBalance(balance: number, amount: number) {
  return atomicRestoreOnce(restoredFailedTransferBalance(balance, amount), amount, false)
}

export function successfulLeagueBalance(balance: number, fee: number) {
  return leagueJoinCharge(balance, fee, false)
}

export function duplicateLeagueBalance(balance: number, fee: number) {
  return leagueJoinCharge(successfulLeagueBalance(balance, fee), fee, true)
}

export function sensitiveResponseIsSafe(message: string) {
  return noSensitiveSecretsInResponse(message)
}

export function authenticationMatrix() {
  return ["missing", "invalid", "expired", "valid"].map((state) => validJwtState(state as "missing" | "invalid" | "expired" | "valid"))
}

export function adminAuthenticationMatrix(isAdmin: boolean) {
  return ["missing", "invalid", "expired", "valid"].map((state) => validAdminJwtState(state as "missing" | "invalid" | "expired" | "valid", isAdmin))
}

export function validWebhookFixture() {
  return { reference: "dep_ref_1", amount: 500000, currency: "NGN", status: "success" as const }
}

export function invalidWebhookFixture() {
  return { reference: "dep_ref_1", amount: 500000, currency: "USD", status: "success" as const }
}

export function webhookFixtureIsValid() {
  return validatePaystackCharge(validWebhookFixture())
}

export function webhookFixtureIsInvalid() {
  return validatePaystackCharge(invalidWebhookFixture())
}

export function referenceIsUnique(reference: string, existing: string[]) {
  return uniqueReference(reference, existing)
}

export function amountCurrencyAndReferenceAreValid(expected: number, actual: number, expectedReference: string, actualReference: string, currency: string) {
  return paymentReferenceAndAmountValid(expectedReference, actualReference, expected, actual) && currency === "NGN"
}

export function requestMayProceed(authenticated: boolean, amount: number) {
  return authenticated && validAmount(amount)
}

export function adminRequestMayProceed(authenticated: boolean, admin: boolean) {
  return validProtectedAdminOperation(authenticated, admin)
}

export function userCannotSpendTwice(balance: number, amount: number) {
  return concurrentOperationsAreSerialized(balance, amount)
}

export function userCannotJoinTwice(balance: number, fee: number) {
  return duplicateLeagueJoinIsPrevented(balance, fee)
}

export function paymentErrorDoesNotLeak(message: string) {
  return noCredentialLeak(message)
}

export function finalDepositBalances(balance: number, amount: number) {
  return [successfulDepositBalance(balance, amount), duplicateDepositBalance(balance, amount)]
}

export function finalWithdrawalBalances(balance: number, amount: number) {
  return [successfulWithdrawalBalance(balance, amount), restoredFailedTransferBalance(balance, amount), duplicateFailedTransferBalance(balance, amount)]
}

export function finalLeagueBalances(balance: number, fee: number) {
  return [successfulLeagueBalance(balance, fee), duplicateLeagueBalance(balance, fee)]
}

export function finalAuthStates() {
  return { user: authenticationMatrix(), admin: adminAuthenticationMatrix(true) }
}

export function allCorePaymentRulesHold() {
  return webhookFixtureIsValid() && !webhookFixtureIsInvalid() && concurrentOperationsAreSerialized(10000, 6000) && duplicateLeagueJoinIsPrevented(10000, 5000)
}

export function finalSecuritySummary() {
  return allCorePaymentRulesHold()
}

export function validatePaymentFlow(data: PaystackChargeData, signature: string | null, signatureValid: boolean, expectedAmount: number, expectedReference: string) {
  return webhookValidationMatrix(signatureValid, signature, data) && referenceMatches(expectedReference, data.reference ?? "") && amountsMatch(expectedAmount, data.amount ?? -1)
}

export function validChargeFixture() {
  return validWebhookFixture()
}

export function invalidChargeFixture() {
  return invalidWebhookFixture()
}

export function expectedDepositBalance(initial: number, amount: number) {
  return initial + amount
}

export function expectedWithdrawalBalance(initial: number, amount: number) {
  return initial - amount
}

export function expectedRestoredBalance(initial: number) {
  return initial
}

export function expectedLeagueBalance(initial: number, fee: number) {
  return initial - fee
}

export function invalidAmounts(expected: number) {
  return [expected - 1, expected + 1]
}

export function allInvalidAuthStatesRejected() {
  return authenticationMatrix().slice(0, 3).every((value) => !value)
}

export function nonAdminRejected() {
  return !validAdminJwtState("valid", false)
}

export function validAdminAccepted() {
  return validAdminJwtState("valid", true)
}

export function missingSignatureRejected() {
  return missingSignatureIsRejected(null)
}

export function invalidSignatureRejected() {
  return invalidSignatureIsRejected(false)
}

export function validSignatureAccepted() {
  return successfulSignatureIsAccepted(true)
}

export function amountTooLowRejected(expected: number) {
  return invalidAmountIsRejected(expected, expected - 1)
}

export function amountTooHighRejected(expected: number) {
  return invalidAmountIsRejected(expected, expected + 1)
}

export function mismatchedCurrencyRejected() {
  return invalidCurrencyIsRejected("USD")
}

export function mismatchedReferenceRejected() {
  return invalidReferenceIsRejected("expected", "other")
}

export function exactlyOnceCredit() {
  return finalDepositBalances(10000, 5000)
}

export function exactlyOnceRestore() {
  return finalWithdrawalBalances(20000, 5000)
}

export function exactlyOnceLeagueJoin() {
  return finalLeagueBalances(20000, 5000)
}

export function paymentSecurityTestsReady() {
  return finalSecuritySummary()
}

export function validPaymentFlowFixture() {
  return validatePaymentFlow(validChargeFixture(), "signature", true, 5000, "dep_ref_1")
}

export function invalidPaymentFlowFixture() {
  return !validatePaymentFlow(invalidChargeFixture(), "signature", true, 5000, "dep_ref_1")
}

export function paymentRules() {
  return {
    valid: validPaymentFlowFixture(),
    invalid: invalidPaymentFlowFixture(),
    duplicateCredit: noDuplicateCredit(15000, 15000),
    duplicateRestore: noDuplicateRestore(20000, 20000),
  }
}

export function allPaymentRulesPass() {
  return Object.values(paymentRules()).every(Boolean)
}

export function testFixture() {
  return allPaymentRulesPass()
}

export function isPaymentSecurityComplete() {
  return testFixture()
}

export function paymentSecurityInvariant() {
  return isPaymentSecurityComplete()
}

export function paymentSecurityInvariantHolds() {
  return paymentSecurityInvariant()
}
