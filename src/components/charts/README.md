# Dashboard Analytics Charts

This directory contains reusable chart components for the admin dashboard analytics feature.

## Components

### 1. GrowthTrendChart
**File:** `GrowthTrendChart.tsx`

An area chart showing user growth trends over time for both doctors and patients.

**Props:**
- `data: GrowthDataPoint[]` - Array of data points with month, doctors, and patients counts

**Example:**
```tsx
<GrowthTrendChart data={[
  { month: 'Jan', doctors: 950, patients: 6200 },
  { month: 'Feb', doctors: 1020, patients: 6800 }
]} />
```

### 2. SpecializationChart
**File:** `SpecializationChart.tsx`

A horizontal bar chart displaying the top 10 doctor specializations by count.

**Props:**
- `data: SpecializationData[]` - Array of specializations with name and count

**Example:**
```tsx
<SpecializationChart data={[
  { name: 'Cardiology', count: 142 },
  { name: 'Neurology', count: 128 }
]} />
```

### 3. CategoryDistributionChart
**File:** `CategoryDistributionChart.tsx`

A pie chart showing distribution across categories (topics, etc.).

**Props:**
- `data: CategoryData[]` - Array of categories with category name and count
- `title: string` - Chart title

**Example:**
```tsx
<CategoryDistributionChart
  data={[
    { category: 'Cardiology', count: 58 },
    { category: 'Neurology', count: 42 }
  ]}
  title="Topic Categories Distribution"
/>
```

### 4. UserStatusChart
**File:** `UserStatusChart.tsx`

A grouped bar chart comparing active vs inactive users for different user types.

**Props:**
- `data: UserStatusData[]` - Array with user type, active count, and inactive count

**Example:**
```tsx
<UserStatusChart data={[
  { type: 'Doctors', active: 1189, inactive: 58 },
  { type: 'Patients', active: 8456, inactive: 476 }
]} />
```

### 5. VerificationChart
**File:** `VerificationChart.tsx`

A stacked bar chart showing verification status breakdown.

**Props:**
- `data: VerificationData[]` - Array with label, verified count, and unverified count

**Example:**
```tsx
<VerificationChart data={[
  { label: 'Doctor Email', verified: 1198, unverified: 49 },
  { label: 'Doctor Phone', verified: 1142, unverified: 105 }
]} />
```

### 6. StatusDistributionChart
**File:** `StatusDistributionChart.tsx`

A pie chart showing status distribution (published, draft, scheduled, etc.).

**Props:**
- `data: StatusData[]` - Array of status entries with status name and count
- `title: string` - Chart title

**Example:**
```tsx
<StatusDistributionChart
  data={[
    { status: 'published', count: 285 },
    { status: 'draft', count: 42 }
  ]}
  title="Content Status"
/>
```

## Common Features

All charts include:
- Responsive design (automatically adjusts to container width)
- Custom tooltips with detailed information
- Consistent color schemes
- Loading states
- Error handling
- Accessibility support

## Dependencies

- **recharts** - Main charting library
- **lucide-react** - Icons
- **tailwindcss** - Styling

## Customization

Each chart component uses Tailwind CSS classes and can be customized by:
1. Modifying the color arrays in each component
2. Adjusting dimensions in ResponsiveContainer
3. Customizing tooltip styles
4. Changing chart types (area to line, bar to column, etc.)

## Performance Notes

- Charts only render when data is available
- Lazy loading with conditional rendering
- Optimized re-renders with React hooks
- Efficient data transformation
