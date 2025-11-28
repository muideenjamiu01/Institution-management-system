# React Query Setup Complete ✅

React Query (TanStack Query) has been successfully integrated into your frontend application! This will significantly reduce API call issues and rate limiting.

## What's Been Set Up

### 1. Dependencies Installed
- `@tanstack/react-query` - Main library
- `@tanstack/react-query-devtools` - Development tools

### 2. Files Created

#### `/frontend/lib/query-client.ts`
Central QueryClient configuration with optimized defaults:
- 5 minute stale time
- 10 minute cache time
- Disabled automatic refetching on window focus
- 1 retry on failure

#### `/frontend/lib/hooks/useApplicantQueries.ts`
Custom hooks for applicant portal:
- `useApplicantProfile()` - Get profile data
- `useUpdateProfile()` - Update profile
- `useApplicationStatus()` - Get application status
- `useSubmitApplication()` - Submit application
- `usePaymentHistory()` - Get payment history
- `useInitializeApplicationFee()` - Initialize application fee payment
- `useInitializeAcceptanceFee()` - Initialize acceptance fee payment
- `useVerifyPayment()` - Verify payment

#### `/frontend/lib/hooks/useStudentQueries.ts`
Custom hooks for student portal:
- Dashboard: `useDashboardStats()`, `useDashboardActivities()`, `useDashboardNotifications()`
- Courses: `useAvailableCourses()`, `useRegisteredCourses()`, `useRegisterCourse()`, `useDropCourse()`
- Assignments: `useAssignments()`, `useAssignmentDetails()`, `useSubmitAssignment()`
- Results: `useResults()`, `useGPA()`, `useCGPA()`
- Payments: `useInvoices()`, `usePaymentHistory()`, `useInitializePayment()`, `useVerifyPayment()`
- Profile: `useStudentProfile()`, `useUpdateStudentProfile()`, `useChangePassword()`

### 3. Root Layout Updated
QueryClientProvider wrapper added to `/frontend/app/layout.tsx` with React Query DevTools

## Benefits

✨ **Automatic Caching** - Data is cached and reused, reducing API calls
✨ **Smart Refetching** - Only refetches when data is stale
✨ **Request Deduplication** - Multiple components requesting same data = 1 API call
✨ **Background Updates** - Updates data in background without blocking UI
✨ **Optimistic Updates** - Instant UI updates before server confirmation
✨ **Error Handling** - Built-in error states and retry logic
✨ **Loading States** - Automatic loading indicators

## How to Use

### Example 1: Fetching Data (Applicant Profile)

**Before (Old Way):**
\`\`\`tsx
const [profile, setProfile] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getProfile();
      setProfile(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  fetchProfile();
}, []);
\`\`\`

**After (React Query):**
\`\`\`tsx
import { useApplicantProfile } from '@/lib/hooks/useApplicantQueries';

const { data: profile, isLoading, error, refetch } = useApplicantProfile();

// Use it in your JSX:
if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;

// Manual refetch when needed
<button onClick={() => refetch()}>Refresh</button>
\`\`\`

### Example 2: Mutations (Updating Profile)

**Before:**
\`\`\`tsx
const [loading, setLoading] = useState(false);

const handleSubmit = async (data) => {
  try {
    setLoading(true);
    await profileApi.updateProfile(data);
    toast({ title: 'Success' });
    // Manually refetch profile
    await fetchProfile();
  } catch (err) {
    toast({ title: 'Error', variant: 'destructive' });
  } finally {
    setLoading(false);
  }
};
\`\`\`

**After:**
\`\`\`tsx
import { useUpdateProfile } from '@/lib/hooks/useApplicantQueries';

const updateProfile = useUpdateProfile();

const handleSubmit = (data) => {
  updateProfile.mutate(data);
  // That's it! Toast and cache updates are automatic
};

// Loading state
{updateProfile.isPending && <Spinner />}
\`\`\`

### Example 3: Student Dashboard

\`\`\`tsx
'use client';

import {
  useDashboardStats,
  useDashboardActivities,
  useDashboardNotifications,
} from '@/lib/hooks/useStudentQueries';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities } = useDashboardActivities();
  const { data: notifications } = useDashboardNotifications();

  if (statsLoading) return <Skeleton />;

  return (
    <div>
      <h1>Dashboard</h1>
      <div>GPA: {stats?.gpa}</div>
      <div>Credits: {stats?.totalCredits}</div>
      
      {activities?.map(activity => (
        <ActivityCard key={activity.id} {...activity} />
      ))}
    </div>
  );
}
\`\`\`

### Example 4: Course Registration with Optimistic Updates

\`\`\`tsx
import { useRegisteredCourses, useRegisterCourse } from '@/lib/hooks/useStudentQueries';

export default function CourseRegistration() {
  const { data: courses } = useRegisteredCourses({ semester: 1 });
  const registerCourse = useRegisterCourse();

  const handleRegister = (courseId: number) => {
    registerCourse.mutate({
      courseId,
      sessionId: 1,
      semester: 1,
    });
  };

  return (
    <div>
      {courses?.map(course => (
        <CourseCard 
          key={course.id} 
          course={course}
          onRegister={() => handleRegister(course.id)}
          isRegistering={registerCourse.isPending}
        />
      ))}
    </div>
  );
}
\`\`\`

### Example 5: Manual Refetch

\`\`\`tsx
const { data, refetch } = useApplicantProfile();

// Refetch on button click
<button onClick={() => refetch()}>Refresh Profile</button>

// Or with a promise
const handleRefresh = async () => {
  const result = await refetch();
  console.log(result.data);
};
\`\`\`

## React Query DevTools

In development, you'll see a small icon in the bottom corner of your screen. Click it to open DevTools showing:
- All queries and their states
- Cache contents
- Query timings
- Network activity

## Advanced Patterns

### Dependent Queries
\`\`\`tsx
const { data: profile } = useApplicantProfile();
const { data: application } = useApplicationStatus({
  enabled: !!profile?.id, // Only fetch when profile is loaded
});
\`\`\`

### Pagination
\`\`\`tsx
const [page, setPage] = useState(1);
const { data, isLoading } = usePaymentHistory({ page });
\`\`\`

### Infinite Queries (for infinite scroll)
Could be added if needed!

## Migration Strategy

You don't need to migrate everything at once. Both old and new patterns will work. Gradually update components:

1. ✅ Payment verification page (already updated)
2. Start with frequently-used pages (dashboard, profile)
3. Move to complex pages with multiple API calls
4. Update remaining pages

## Common Hooks API

All query hooks return:
- `data` - The fetched data
- `error` - Error object if request failed
- `isLoading` - True on first load
- `isFetching` - True when fetching (including background updates)
- `isError` - True if error occurred
- `isSuccess` - True if successful
- `refetch()` - Function to manually refetch

All mutation hooks return:
- `mutate()` - Trigger the mutation
- `mutateAsync()` - Trigger with promise
- `isPending` - True while mutation is running
- `isError` - True if mutation failed
- `isSuccess` - True if mutation succeeded
- `data` - Response data
- `error` - Error object

## Query Keys Structure

Query keys are hierarchical for easy invalidation:

\`\`\`typescript
applicant:
  - profile
  - application
    - status
  - payments
    - history

student:
  - dashboard
    - stats
    - activities
    - notifications
  - courses
    - available
    - registered
  - results
    - list
    - gpa
    - cgpa
\`\`\`

Invalidate all student data: \`queryClient.invalidateQueries({ queryKey: studentKeys.all })\`
Invalidate just courses: \`queryClient.invalidateQueries({ queryKey: studentKeys.courses() })\`

## Troubleshooting

### Rate Limiting Still Occurring?
- Check if components are mounted/unmounted frequently
- Increase \`staleTime\` for that specific query
- Use \`enabled: false\` and trigger manually with \`refetch()\`

### Data Not Updating?
- Check if you're invalidating the right query keys
- Use DevTools to see cache state
- Call \`refetch()\` manually if needed

### TypeScript Errors?
- Most hooks infer types from the API functions
- Add explicit types if needed: \`useQuery<ProfileType>(...)\`

## Next Steps

1. Update other high-traffic pages
2. Consider adding optimistic updates for better UX
3. Add proper TypeScript types for all API responses
4. Consider implementing infinite queries for lists
5. Set up proper error boundaries

Need help migrating a specific component? Let me know!
