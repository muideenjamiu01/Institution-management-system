# Academic Sessions Setup Guide

## Quick Start

You now have a **Sessions Management Page** at `/dashboard/sessions` where you can create and manage academic sessions directly from the admin dashboard.

## How to Create Your First Session

### Option 1: Using the Admin Dashboard (Recommended)

1. **Navigate to Sessions Page**
   - Go to: `http://localhost:3000/dashboard/sessions`
   - Or add a menu link to "Sessions" in your admin dashboard

2. **Click "Create Session"**
   - Enter session name (e.g., `2025/2026`)
   - Select start date (e.g., September 1, 2025)
   - Select end date (e.g., August 31, 2026)
   - Check "Set as active session" if this is the current academic year
   - Click "Create Session"

3. **Your session is now ready!**
   - It will appear in the payments page dropdown
   - You can create invoices for this session

### Option 2: Using the Database Directly

If you prefer to seed initial sessions via SQL:

```sql
INSERT INTO "Session" (name, "startDate", "endDate", "isActive", "createdAt", "updatedAt")
VALUES 
  ('2024/2025', '2024-09-01', '2025-08-31', false, NOW(), NOW()),
  ('2025/2026', '2025-09-01', '2026-08-31', true, NOW(), NOW()),
  ('2026/2027', '2026-09-01', '2027-08-31', false, NOW(), NOW());
```

### Option 3: Using Prisma Studio

```bash
cd ims-backend
npx prisma studio
```

Then create sessions directly in the Session table.

## Features of the Sessions Management Page

### View All Sessions
- See all academic sessions with their dates
- View status (Active/Inactive)
- Track when each session was created

### Manage Sessions
- **Activate/Deactivate**: Toggle session status
  - Only one session can be active at a time
  - Activating a session automatically deactivates others
  
- **Delete Sessions**: Remove sessions that are no longer needed
  - Protection: Cannot delete sessions with associated invoices
  - Must reassign or delete invoices first

### Session Naming Convention
- **Recommended Format**: `YYYY/YYYY` (e.g., `2025/2026`)
- **Alternative**: `YYYY-YYYY` (e.g., `2025-2026`)
- Keep it consistent across your institution

## API Endpoints

### Session Management
```
POST   /api/admin/sessions          - Create new session
GET    /api/admin/sessions          - Get all sessions
GET    /api/admin/sessions/active   - Get active session
GET    /api/admin/sessions/:id      - Get specific session
PATCH  /api/admin/sessions/:id      - Update session
DELETE /api/admin/sessions/:id      - Delete session
```

### Request/Response Examples

**Create Session:**
```json
POST /api/admin/sessions
{
  "name": "2025/2026",
  "startDate": "2025-09-01T00:00:00.000Z",
  "endDate": "2026-08-31T23:59:59.999Z",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "id": 1,
    "name": "2025/2026",
    "startDate": "2025-09-01T00:00:00.000Z",
    "endDate": "2026-08-31T23:59:59.999Z",
    "isActive": true,
    "createdAt": "2026-01-03T10:00:00.000Z",
    "updatedAt": "2026-01-03T10:00:00.000Z"
  }
}
```

## Integration with Payment System

Once sessions are created:

1. **Payment Page**: Sessions appear in the session dropdown
2. **Invoice Creation**: Select session when creating invoices
3. **Filtering**: Filter payments by academic session
4. **Statistics**: View payment stats per session

## Best Practices

### Session Planning
- Create sessions at the beginning of each academic year
- Set only the current session as active
- Keep past sessions for historical records

### Naming Consistency
- Use same format for all sessions
- Examples: `2024/2025`, `2025/2026`, `2026/2027`
- Avoid variations like `24/25` or `2024-25`

### Active Session Management
- Only one session should be active at a time
- Update active status when new academic year starts
- Invoices default to active session if not specified

### Data Protection
- Cannot delete sessions with invoices
- This prevents accidental data loss
- Archive old sessions instead of deleting

## Troubleshooting

### Session Dropdown Empty in Payments Page
**Problem**: No sessions showing when creating invoices  
**Solution**: 
1. Go to `/dashboard/sessions`
2. Create at least one session
3. Set it as active
4. Refresh the payments page

### Multiple Active Sessions
**Problem**: More than one session marked as active  
**Solution**: The system automatically handles this:
- When you activate a session, others are deactivated
- Only the most recently activated session stays active

### Can't Delete Session
**Problem**: "Cannot delete session. It has X associated invoices"  
**Solution**:
1. Reassign invoices to another session, OR
2. Delete the invoices (if appropriate), OR
3. Keep the session for historical records

### Sessions Not Loading
**Problem**: Session page shows loading or error  
**Solution**:
1. Check backend is running: `http://localhost:5000/api/health`
2. Verify database connection
3. Check browser console for errors
4. Verify authentication token is valid

## Quick Commands

```bash
# Start backend server
cd ims-backend
npm run dev

# Start frontend
cd frontend
npm run dev

# Open Prisma Studio to manage sessions directly
cd ims-backend
npx prisma studio

# View backend logs
cd ims-backend
tail -f logs/combined.log
```

## Next Steps

After creating sessions:
1. ✅ Create invoices for students
2. ✅ Filter payments by session
3. ✅ View session-specific statistics
4. ✅ Export session payment reports

## Support

If you encounter issues:
1. Check this guide first
2. Review backend logs: `ims-backend/logs/combined.log`
3. Check browser console for frontend errors
4. Verify session exists in database: Use Prisma Studio
