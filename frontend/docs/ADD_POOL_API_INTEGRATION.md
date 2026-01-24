# Add Pool Modal - API Integration Guide

## Overview
The Add Pool Modal component has been created with placeholder methods for API integration. This guide shows you where to add your actual API calls.

## Files Created
- `add-pool-modal.component.ts` - Component logic
- `add-pool-modal.component.html` - Modal template
- `add-pool-modal.component.scss` - Modal styles

## API Integration Points

### 1. Load Aquatic Species (ngOnInit)
**Location:** `add-pool-modal.component.ts` line ~60

```typescript
ngOnInit() {
  // TODO: Replace with actual API calls
  this.loadSpecies();
  this.loadRegions();
}

private loadSpecies() {
  // Replace this with your actual API service
  this.speciesService.getAllSpecies().subscribe({
    next: (data) => {
      this.species = data;
    },
    error: (error) => {
      console.error('Error loading species:', error);
    }
  });
}
```

### 2. Load Regions (ngOnInit)
**Location:** `add-pool-modal.component.ts` line ~70

```typescript
private loadRegions() {
  // Replace this with your actual API service
  this.regionService.getAllRegions().subscribe({
    next: (data) => {
      this.regions = data;
    },
    error: (error) => {
      console.error('Error loading regions:', error);
    }
  });
}
```

### 3. Create Pool (onSubmit)
**Location:** `add-pool-modal.component.ts` line ~100

```typescript
onSubmit() {
  if (!this.isFormValid()) {
    return;
  }

  this.isSubmitting = true;

  // TODO: Get actual owner_id from authentication service
  const ownerId = this.authService.getCurrentUserId();

  const newPool: NewPoolData = {
    pool_name: this.poolName,
    species_id: this.selectedSpeciesId,
    region_id: this.selectedRegionId,
    owner_id: ownerId
  };

  // Replace this with your actual API call
  this.poolService.createPool(newPool).subscribe({
    next: (response) => {
      this.poolAdded.emit(response);
      this.closeModal();
      this.isSubmitting = false;
      // Optional: Show success message
      this.toastService.success('Pool created successfully!');
    },
    error: (error) => {
      console.error('Error creating pool:', error);
      this.isSubmitting = false;
      // Optional: Show error message
      this.toastService.error('Failed to create pool. Please try again.');
    }
  });
}
```

## Required API Endpoints

### 1. GET /api/species
Returns list of aquatic species
```json
[
  {
    "species_id": "SHRIMP_VANNAMEI",
    "species_name": "White Leg Shrimp (Vannamei)"
  }
]
```

### 2. GET /api/regions
Returns list of regions
```json
[
  {
    "region_id": "550e8400-e29b-41d4-a716-446655440001",
    "region_name": "Mekong Delta"
  }
]
```

### 3. POST /api/pools
Creates a new pool
```json
// Request Body
{
  "pool_name": "Main Shrimp Pool A1",
  "species_id": "SHRIMP_VANNAMEI",
  "region_id": "550e8400-e29b-41d4-a716-446655440001",
  "owner_id": "550e8400-e29b-41d4-a716-446655440000"
}

// Response
{
  "pool_id": "generated-uuid",
  "pool_name": "Main Shrimp Pool A1",
  "species_id": "SHRIMP_VANNAMEI",
  "region_id": "550e8400-e29b-41d4-a716-446655440001",
  "owner_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-18T10:18:00Z",
  "updated_at": "2026-01-18T10:18:00Z"
}
```

## Usage in Dashboard

The modal is already integrated into the dashboard page:

```typescript
// dashboard-pages.ts
onAddPool() {
  this.addPoolModal.open();
}

onPoolAdded(poolData: any) {
  console.log('New pool created:', poolData);
  // TODO: Refresh pool list
  this.poolService.getAllPools().subscribe(pools => {
    // Update pools list
  });
}
```

## Next Steps

1. Create or update your `PoolService` with a `createPool(data: NewPoolData)` method
2. Create services for Species and Regions if they don't exist
3. Implement the API endpoints in your backend
4. Update the TODO comments with actual service calls
5. Add proper error handling and user feedback (toast notifications, etc.)
6. Get the actual `owner_id` from your authentication service

## Testing

Currently, the modal uses mock data and simulates API calls with setTimeout. You can:
1. Click "Add New Pool" button in dashboard
2. Fill in the form
3. Click "Create Pool"
4. Check console for the submitted data

The actual API integration can be done by uncommenting and implementing the TODO sections.
