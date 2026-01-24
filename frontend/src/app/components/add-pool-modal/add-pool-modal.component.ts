/**
 * ADD POOL MODAL COMPONENT
 * ========================
 * This component provides a modal dialog for creating a new aquaculture pool.
 * It includes a form with validation for pool name, species selection, and region selection.
 * 
 * Features:
 * - Form validation before submission
 * - Loading state during submission
 * - Event emitters for parent component communication
 * - Modal can be closed by backdrop click or close button
 * 
 * Usage:
 * 1. Add component to parent template: <app-add-pool-modal></app-add-pool-modal>
 * 2. Use ViewChild to access component methods
 * 3. Call open() method to display modal
 * 4. Listen to poolAdded event for successful creation
 */

import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PoolService } from '../../services/pool.service';

/**
 * Interface for Aquatic Species data structure
 * Matches the database table: aquatic_species
 */
export interface AquaticSpecies {
  species_id: string;      // Unique identifier for the species (e.g., 'SHRIMP_VANNAMEI')
  species_name: string;    // Human-readable species name (e.g., 'White Leg Shrimp')
}

/**
 * Interface for Region data structure
 * Matches the database table: region
 */
export interface Region {
  region_id: string;       // UUID identifier for the region
  region_name: string;     // Human-readable region name (e.g., 'Mekong Delta')
}

/**
 * Interface for new pool data structure
 * Matches the required fields for the pool database table
 */
export interface NewPoolData {
  pool_name: string;       // Name of the pool (e.g., 'Main Shrimp Pool A1')
  species_id: string;      // Foreign key to aquatic_species table
  region_id: string;       // Foreign key to region table
  owner_id: string;        // Foreign key to users table (current user)
}

@Component({
  selector: 'app-add-pool-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],  // CommonModule for *ngIf, FormsModule for [(ngModel)]
  templateUrl: './add-pool-modal.component.html',
  styleUrl: './add-pool-modal.component.scss'
})
export class AddPoolModalComponent implements OnInit {
  
  // ==================== INJECTED SERVICES ====================
  
  /**
   * PoolService: Provides access to pool-related API calls
   */
  private poolService = inject(PoolService);
  
  // ==================== OUTPUTS ====================
  /**
   * Emitted when the modal is closed (by user action)
   * Parent component can listen to this to perform cleanup
   */
  @Output() close = new EventEmitter<void>();
  
  /**
   * Emitted when a pool is successfully created
   * Contains the new pool data that was submitted
   * Parent component can use this to refresh pool list or show success message
   */
  @Output() poolAdded = new EventEmitter<NewPoolData>();

  // ==================== COMPONENT STATE ====================
  /**
   * Controls modal visibility
   * true = modal is displayed, false = modal is hidden
   */
  isOpen = false;
  
  /**
   * Tracks form submission state
   * true = form is being submitted (shows loading state)
   * false = form is idle (allows submission)
   */
  isSubmitting = false;

  // ==================== FORM DATA ====================
  /**
   * Stores the pool name input value
   * Bound to input field via [(ngModel)]
   */
  poolName = '';
  
  /**
   * Stores the selected species ID
   * Bound to species dropdown via [(ngModel)]
   */
  selectedSpeciesId = '';

  // ==================== DROPDOWN OPTIONS ====================
  /**
   * List of available aquatic species for user selection
   * Will be populated from API in ngOnInit
   */
  species: AquaticSpecies[] = [];

  /**
   * List of available regions for user selection
   * According to API docs, valid regions are: "Miền Bắc", "Miền Trung", "Miền Nam"
   * Note: API accepts region_name as string, not region_id
   */
  regions: { region_name: string }[] = [
    { region_name: 'Vĩnh Long' },
  ];
  
  /**
   * Stores the selected region name (not ID, as API expects region_name)
   */
  selectedRegionName = '';

  // ==================== LIFECYCLE HOOKS ====================
  /**
   * Angular lifecycle hook - called when component is initialized
   * Loads species list from API
   */
  ngOnInit() {
    this.loadSpecies();
  }

  // ==================== API INTEGRATION METHODS ====================
  
  /**
   * Load species from API
   */
  private loadSpecies() {
    this.poolService.getAllSpecies().subscribe({
      next: (data) => {
        this.species = data;
        console.log('Species loaded:', data);
      },
      error: (error) => {
        console.error('Error loading species:', error);
        // Fallback to mock data if API fails
        this.species = [
          { species_id: 'tom', species_name: 'Tôm' },
          { species_id: 'ca', species_name: 'Cá' },
          { species_id: 'cua', species_name: 'Cua' }
        ];
      }
    });
  }

  // ==================== MODAL CONTROL METHODS ====================
  /**
   * Opens the modal and resets the form
   * Called programmatically from parent component
   * 
   * Usage:
   * @ViewChild(AddPoolModalComponent) modal!: AddPoolModalComponent;
   * this.modal.open();
   */
  open() {
    this.isOpen = true;      // Show the modal
    this.resetForm();        // Clear any previous form data
  }

  /**
   * Closes the modal and emits close event
   * Can be called by:
   * - Close button (X) click
   * - Backdrop click
   * - After successful submission
   */
  closeModal() {
    this.isOpen = false;     // Hide the modal
    this.close.emit();       // Notify parent component
  }

  /**
   * Resets all form fields to their initial empty state
   * Called when modal is opened to ensure clean state
   */
  resetForm() {
    this.poolName = '';
    this.selectedSpeciesId = '';
    this.selectedRegionName = '';
  }

  // ==================== FORM VALIDATION ====================
  /**
   * Validates the form before submission
   * 
   * Validation rules:
   * - Pool name must not be empty (trimmed)
   * - Species must be selected
   * - Region must be selected
   * 
   * @returns true if form is valid, false otherwise
   * 
   * Used to:
   * - Disable submit button in template
   * - Prevent submission of invalid data
   */
  isFormValid(): boolean {
    return this.poolName.trim() !== '' && 
           this.selectedSpeciesId !== '' && 
           this.selectedRegionName !== '';
  }

  // ==================== FORM SUBMISSION ====================
  /**
   * Handles form submission
   * 
   * Flow:
   * 1. Validate form data
   * 2. Set loading state
   * 3. Prepare pool data object
   * 4. Call API to create pool
   * 5. Emit success event
   * 6. Close modal
   */
  onSubmit() {
    // Early return if form is invalid
    if (!this.isFormValid()) {
      return;
    }

    // Set loading state (disables button, shows spinner)
    this.isSubmitting = true;

    // Prepare data object matching the API requirements
    const newPoolData = {
      pool_name: this.poolName,
      region_name: this.selectedRegionName,  // API expects region_name, not region_id
      species_id: this.selectedSpeciesId
    };

    // Call API to create pool
    this.poolService.addPool(newPoolData).subscribe({
      next: (response) => {
        console.log('Pool created successfully:', response);
        this.isSubmitting = false;        // Reset loading state
        this.poolAdded.emit(response);     // Emit success event with API response
        this.closeModal();                 // Close the modal
      },
      error: (error) => {
        console.error('Error creating pool:', error);
        this.isSubmitting = false;         // Reset loading state
        // Show error message to user
        alert('Có lỗi xảy ra khi tạo hồ. Vui lòng thử lại.');
      }
    });
  }

  // ==================== EVENT HANDLERS ====================
  /**
   * Handles clicks on the modal backdrop
   * Closes the modal only if user clicked directly on backdrop
   * (not on the modal content itself)
   * 
   * @param event - Mouse click event
   */
  onBackdropClick(event: MouseEvent) {
    // Check if the clicked element has the 'modal-backdrop' class
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }
}
