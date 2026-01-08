# Account Sharing Feature

## Overview
Allow users to share their Barkly account (dogs, events, vets, medicines, etc.) with other users. Both accounts see and manage the same data as if it were their own.

## User Story

**Example Scenario:**
- Account A creates 2 dogs, medicines, vets, events, etc.
- Account A invites Account B by entering their email
- Account B logs in and accepts the invitation
- Both Account A and B now see the same timeline, events, dogs, and everything
- They manage the data together seamlessly
- Either account can break the link at any time

## Design Decisions

### Data Visibility
- **No attribution shown** - Don't display who created which dog/event/vet
- All shared data appears as "our" data, not "Account A's dog" vs "Account B's dog"
- Unified experience - can't tell who originally created what

### Link Behavior
- **Bidirectional/Mutual links** - If A links to B, B automatically links to A
- Links are symmetric - both accounts have equal access

### Unlinking Behavior
- **Data stays with original owner** - When unlinking:
  - Account A keeps all dogs/events/vets they created
  - Account B keeps all dogs/events/vets they created
  - If Account B created events for Account A's dog, those events stay with Account B (but lose the dog context)
  - No data is deleted, just access is removed

### Email Invitations
- Can invite by email even if the person hasn't created an account yet
- Invitation remains pending until that email signs up and accepts
- On first login, users see any pending invitations waiting for them

## Database Schema

### New Table: `account_links`

```python
class DBAccountLink(Base):
    """Account Link model - stores relationships between users"""
    __tablename__ = "account_links"

    id = Column(String, primary_key=True, index=True)
    inviter_user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    invitee_email = Column(String, nullable=False, index=True)  # Email entered
    invitee_user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)  # Populated when accepted
    status = Column(Enum('pending', 'accepted', 'rejected'), default='pending', nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    inviter = relationship("DBUser", foreign_keys=[inviter_user_id])
    invitee = relationship("DBUser", foreign_keys=[invitee_user_id])
```

## Backend Implementation

### New API Endpoints

#### 1. Create Account Link (Invite)
```
POST /api/account-links
Body: { "email": "friend@example.com" }
Response: AccountLink object

- Validates email format
- Creates link with status='pending'
- If email matches existing user, populate invitee_user_id
- If inviting yourself, return error
- If link already exists, return existing link
```

#### 2. Get Account Links
```
GET /api/account-links
Response: {
  "sent": [links where user is inviter],
  "received": [links where user is invitee],
  "active": [accepted links in both directions]
}

- Returns all links relevant to current user
- Includes pending, accepted, and rejected
```

#### 3. Accept Invitation
```
PUT /api/account-links/{id}/accept
Response: AccountLink object

- Sets status='accepted'
- Populates invitee_user_id if not set
- Creates reciprocal link (so B also links to A)
- Only invitee can accept
```

#### 4. Reject Invitation
```
PUT /api/account-links/{id}/reject
Response: AccountLink object

- Sets status='rejected'
- Only invitee can reject
```

#### 5. Break Link (Delete)
```
DELETE /api/account-links/{id}
Response: 204 No Content

- Deletes the link
- Also deletes the reciprocal link
- Either party can break the link
- No data is deleted, only access is removed
```

### Helper Function - Core Logic

```python
def get_accessible_user_ids(current_user_id: str, db: Session) -> List[str]:
    """
    Returns list of user IDs that the current user can access data for.
    Includes current user + all bidirectionally linked users.

    Returns: [current_user_id, linked_user_1, linked_user_2, ...]
    """
    user_ids = [current_user_id]

    # Get all accepted links where current user is involved
    links = db.query(DBAccountLink).filter(
        or_(
            and_(DBAccountLink.inviter_user_id == current_user_id, DBAccountLink.status == 'accepted'),
            and_(DBAccountLink.invitee_user_id == current_user_id, DBAccountLink.status == 'accepted')
        )
    ).all()

    for link in links:
        if link.inviter_user_id == current_user_id and link.invitee_user_id:
            user_ids.append(link.invitee_user_id)
        elif link.invitee_user_id == current_user_id:
            user_ids.append(link.inviter_user_id)

    return list(set(user_ids))  # Remove duplicates
```

### Modify Existing Endpoints

**ALL existing read endpoints need modification:**

**Before:**
```python
@router.get("/dogs")
def get_dogs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    dogs = db.query(DBDog).filter(DBDog.user_id == current_user.id).all()
    return dogs
```

**After:**
```python
@router.get("/dogs")
def get_dogs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_ids = get_accessible_user_ids(current_user.id, db)
    dogs = db.query(DBDog).filter(DBDog.user_id.in_(user_ids)).all()
    return dogs
```

**Files requiring modification:**
- `/api/dogs/*` - All dog endpoints (GET list, GET by ID)
- `/api/events/*` - All event endpoints
- `/api/vets/*` - All vet endpoints
- `/api/vet-visits/*` - All vet visit endpoints
- `/api/medicines/*` - All medicine endpoints
- `/api/medicine-events/*` - All medicine event endpoints
- `/api/custom-events/*` - All custom event endpoints

**Write/Update/Delete endpoints:**
- Must verify user can access the resource's owner
- Use same `get_accessible_user_ids()` check

**Authorization Pattern:**
```python
@router.delete("/dogs/{dog_id}")
def delete_dog(dog_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    dog = db.query(DBDog).filter(DBDog.id == dog_id).first()
    if not dog:
        raise HTTPException(status_code=404)

    # Check if user can access this dog
    user_ids = get_accessible_user_ids(current_user.id, db)
    if dog.user_id not in user_ids:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(dog)
    db.commit()
    return Response(status_code=204)
```

## Frontend Implementation

### About Page - Account Linking Section

**New UI Components:**

```tsx
<Paper sx={{ p: 3, mt: 3 }}>
  <Typography variant="h6" gutterBottom fontWeight={600}>
    Account Sharing
  </Typography>

  {/* Invite New Account */}
  <Box sx={{ mb: 3 }}>
    <Typography variant="body2" color="text.secondary" paragraph>
      Share your dogs and events with family members or caretakers
    </Typography>
    <Box sx={{ display: 'flex', gap: 2 }}>
      <TextField
        label="Email to invite"
        type="email"
        fullWidth
      />
      <Button variant="contained" startIcon={<SendIcon />}>
        Send Invite
      </Button>
    </Box>
  </Box>

  {/* Active Links */}
  {activeLinks.length > 0 && (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom>
        Linked Accounts
      </Typography>
      <List>
        {activeLinks.map(link => (
          <ListItem key={link.id}>
            <ListItemText primary={link.email} />
            <IconButton onClick={() => handleBreakLink(link.id)}>
              <LinkOffIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )}

  {/* Pending Sent Invitations */}
  {pendingSent.length > 0 && (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom>
        Pending Invitations
      </Typography>
      <List>
        {pendingSent.map(link => (
          <ListItem key={link.id}>
            <ListItemText
              primary={link.invitee_email}
              secondary="Waiting for acceptance"
            />
            <Chip label="Pending" size="small" />
          </ListItem>
        ))}
      </List>
    </Box>
  )}

  {/* Received Invitations */}
  {pendingReceived.length > 0 && (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Invitations for You
      </Typography>
      <List>
        {pendingReceived.map(link => (
          <ListItem key={link.id}>
            <ListItemText
              primary={`From: ${link.inviter_email}`}
              secondary="Share account access"
            />
            <Button
              onClick={() => handleAccept(link.id)}
              color="primary"
              variant="contained"
              size="small"
            >
              Accept
            </Button>
            <Button
              onClick={() => handleReject(link.id)}
              color="error"
              size="small"
            >
              Reject
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  )}
</Paper>
```

### Login Flow Enhancement

**After successful authentication:**

```tsx
// In LoginPage.tsx, after login
const response = await apiClient.auth.googleAuth(credentialResponse.credential);
login(response.access_token, response.user);

// Check for pending invitations
const links = await apiClient.accountLinks.getAll();
const pendingForMe = links.received.filter(l => l.status === 'pending');

if (pendingForMe.length > 0) {
  // Show dialog with pending invitations
  setShowInvitationsDialog(true);
} else {
  // Normal navigation flow
  navigate('/');
}
```

**Dialog Component:**
```tsx
<Dialog open={showInvitationsDialog}>
  <DialogTitle>You Have Pending Invitations</DialogTitle>
  <DialogContent>
    {pendingInvitations.map(link => (
      <Box key={link.id}>
        <Typography>
          {link.inviter_name} wants to share their Barkly account with you
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button onClick={() => handleAcceptLink(link.id)} variant="contained">
            Accept
          </Button>
          <Button onClick={() => handleRejectLink(link.id)}>
            Decline
          </Button>
        </Box>
      </Box>
    ))}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => navigate('/')}>
      Decide Later
    </Button>
  </DialogActions>
</Dialog>
```

### New Frontend Types

```typescript
// In types/index.ts

export interface AccountLink {
  id: string;
  inviter_user_id: string;
  invitee_email: string;
  invitee_user_id?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface AccountLinksResponse {
  sent: AccountLink[];
  received: AccountLink[];
  active: AccountLink[];
}

export interface AccountLinkCreate {
  email: string;
}
```

### New API Client Methods

```typescript
// In api/client.ts

accountLinks: {
  getAll: (): Promise<AccountLinksResponse> => {
    return apiFetch<AccountLinksResponse>('/api/account-links', {
      headers: getAuthHeader(),
    });
  },

  create: (data: AccountLinkCreate): Promise<AccountLink> => {
    return apiFetch<AccountLink>('/api/account-links', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
  },

  accept: (id: string): Promise<AccountLink> => {
    return apiFetch<AccountLink>(`/api/account-links/${id}/accept`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
  },

  reject: (id: string): Promise<AccountLink> => {
    return apiFetch<AccountLink>(`/api/account-links/${id}/reject`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
  },

  delete: (id: string): Promise<void> => {
    return apiFetch<void>(`/api/account-links/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
  },
},
```

## Implementation Phases

### Phase 1: Backend Foundation (4-5 hours)
- [ ] Create `account_links` table and model
- [ ] Create `get_accessible_user_ids()` helper function
- [ ] Implement 5 new account-links endpoints
- [ ] Test endpoints with Postman/curl

### Phase 2: Modify Existing Backend (4-5 hours)
- [ ] Update all GET endpoints to use `get_accessible_user_ids()`
  - [ ] Dogs
  - [ ] Events
  - [ ] Vets
  - [ ] Vet Visits
  - [ ] Medicines
  - [ ] Medicine Events
  - [ ] Custom Events
- [ ] Update all POST/PUT/DELETE endpoints with authorization checks
- [ ] Test shared data access

### Phase 3: Frontend UI (2-3 hours)
- [ ] Create TypeScript types
- [ ] Add API client methods
- [ ] Build Account Linking section in About page
- [ ] Implement invite/accept/reject/break-link functionality
- [ ] Test UI flows

### Phase 4: Login Flow (1 hour)
- [ ] Add pending invitation check on login
- [ ] Create invitation acceptance dialog
- [ ] Handle accept/reject actions
- [ ] Navigate appropriately after decision

### Phase 5: Testing & Edge Cases (2-3 hours)
- [ ] Test invitation of non-existent email
- [ ] Test accepting invitation creates reciprocal link
- [ ] Test unlinking removes data access
- [ ] Test that data stays with original owner after unlink
- [ ] Test authorization on all endpoints
- [ ] Test UI with multiple linked accounts

## Total Estimated Effort
**13-16 hours** of focused development

## Edge Cases to Handle

1. **Self-invitation**: Prevent user from inviting their own email
2. **Duplicate invitations**: Check if link already exists before creating
3. **Email matching**: When user signs up, check if their email has pending invitations
4. **Circular references**: Not an issue with bidirectional design
5. **Orphaned data**: After unlinking, events might reference dogs from other account
   - Solution: Data stays with creator, references may become invalid but that's expected
6. **Multiple simultaneous links**: User can have links with multiple accounts
7. **Invitation spam**: Consider rate limiting invitation creation

## Future Enhancements (Out of Scope)

- Show which account created each item (optional badge)
- Admin/owner designation (one account can restrict what other can do)
- Share only specific dogs, not entire account
- Temporary sharing (auto-expire links after X days)
- Notification system (email when invited, when accepted, etc.)

## Security Considerations

1. **Authorization**: Every endpoint must check `get_accessible_user_ids()`
2. **Email validation**: Validate email format before creating invitation
3. **Rate limiting**: Prevent invitation spam
4. **Privacy**: Don't expose user IDs or sensitive data in responses
5. **Audit trail**: Consider logging link creation/deletion for debugging

## Questions to Resolve Before Implementation

- [ ] Should there be a limit on number of linked accounts? (e.g., max 5)
- [ ] Should we send email notifications when invited?
- [ ] Should we show a badge/indicator that data is shared vs solo?
- [ ] What happens to custom events after unlinking? (They're user-specific, not dog-specific)
- [ ] Should breaking a link require confirmation dialog?

---

## Status: Planned for Future Implementation
This document serves as the complete specification for the account sharing feature. Implementation can begin when prioritized.
