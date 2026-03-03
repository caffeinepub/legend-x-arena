# Legend X Arena

## Current State
- Full dashboard with 5-tab bottom nav (Matches, Ranking, Play, Deposit, Profile)
- Deposit tab shows balance and coin preset buttons (100/500/1000/5000) but they just show "Coming soon" toast
- Admin panel has user search and ban/unban functionality
- Backend has UserProfile with walletBalance, transactions array, register/authenticate/toggleBan/joinTournament

## Requested Changes (Diff)

### Add
- JazzCash deposit number **0324-2646964** displayed prominently in Deposit tab
- Deposit request form: user enters amount + JazzCash transaction ID and submits request
- Backend: DepositRequest type with fields (legendId, amount, transactionId, status: pending/approved/rejected, submittedAt)
- Backend: submitDepositRequest(amount, transactionId) -- stores pending request linked to caller
- Backend: getMyDepositRequests() -- returns caller's deposit requests
- Backend: getPendingDepositRequests() -- admin only, returns all pending requests
- Backend: approveDepositRequest(requestId) -- admin only, sets status to approved and credits coins to user's wallet + adds transaction record
- Backend: rejectDepositRequest(requestId) -- admin only, sets status to rejected
- Admin panel: new "Deposit Requests" tab/section showing all pending requests with Accept/Reject buttons
- Deposit tab: show user's own submitted requests with status badges (Pending / Approved / Rejected)

### Modify
- Deposit tab: replace "Coming soon" coin preset buttons with JazzCash payment instructions + deposit request submission form
- Admin panel: add deposit requests management section alongside existing user search

### Remove
- "Coming soon" toast on coin preset buttons (replaced with actual JazzCash flow)

## Implementation Plan
1. Update backend main.mo: add DepositRequest type, requestsMap, submitDepositRequest, getMyDepositRequests, getPendingDepositRequests, approveDepositRequest, rejectDepositRequest
2. Regenerate backend.d.ts bindings
3. Update DashboardPage Deposit tab: show JazzCash number, amount input, transaction ID input, submit button, list of user's own requests with status
4. Update AdminPage: add "Deposit Requests" section with list of pending requests, Accept/Reject buttons per request
