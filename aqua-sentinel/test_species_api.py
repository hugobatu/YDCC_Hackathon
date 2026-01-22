"""
Test script for the new Species API endpoints
Run this after starting the FastAPI server
"""
import requests
import json

# =========================
# CONFIG
# =========================
BASE_URL = "http://127.0.0.1:8000"
SPECIES_ALL_URL = f"{BASE_URL}/api/pool/species/all"
POOL_SPECIES_URL = f"{BASE_URL}/api/pool/{{pool_id}}/species"

# Replace these with your test credentials
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpassword"
TEST_POOL_ID = None  # Will be set after getting pools

def login():
    """Login and get access token"""
    print("\n=== STEP 1: Login ===")
    login_url = f"{BASE_URL}/api/login"
    
    response = requests.post(login_url, json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    
    if response.status_code == 200:
        result = response.json()
        access_token = result.get("access_token")
        print(f"✓ Login successful! Access token: {access_token[:20]}...")
        return access_token
    else:
        print(f"✗ Login failed: {response.status_code}")
        print(f"  Response: {response.text}")
        return None

def test_get_all_species():
    """Test GET /api/pool/species/all"""
    print("\n=== STEP 2: Test GET /api/pool/species/all ===")
    
    try:
        response = requests.get(SPECIES_ALL_URL)
        
        if response.status_code == 200:
            species_list = response.json()
            print(f"✓ Successfully fetched {len(species_list)} species:")
            
            for species in species_list:
                print(f"  - {species['species_id']}: {species['species_name']}")
            
            return species_list
        else:
            print(f"✗ Request failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return []
            
    except Exception as e:
        print(f"✗ Error: {e}")
        return []

def test_get_my_pools(access_token):
    """Get user's pools to find a test pool_id"""
    print("\n=== STEP 3: Get My Pools ===")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/api/pool/my-pools", headers=headers)
        
        if response.status_code == 200:
            pools = response.json()
            print(f"✓ Found {len(pools)} pools:")
            
            for pool in pools:
                print(f"  - Pool ID: {pool['pool_id']}")
                print(f"    Name: {pool['pool_name']}")
                print(f"    Species: {pool['species']['species_name']}")
            
            if pools:
                return pools[0]['pool_id']
            else:
                print("  ⚠ No pools found. Please create a pool first.")
                return None
        else:
            print(f"✗ Request failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"✗ Error: {e}")
        return None

def test_get_pool_species(pool_id, access_token):
    """Test GET /api/pool/{pool_id}/species"""
    print(f"\n=== STEP 4: Test GET /api/pool/{pool_id}/species ===")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    try:
        url = POOL_SPECIES_URL.format(pool_id=pool_id)
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            pool_species = response.json()
            print(f"✓ Successfully fetched species for pool:")
            print(f"  Pool ID: {pool_species['pool_id']}")
            print(f"  Pool Name: {pool_species['pool_name']}")
            print(f"  Species:")
            print(f"    - ID: {pool_species['species']['species_id']}")
            print(f"    - Name: {pool_species['species']['species_name']}")
            print(f"    - Created: {pool_species['species']['created_at']}")
            print(f"    - Updated: {pool_species['species']['updated_at']}")
            return True
        else:
            print(f"✗ Request failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_unauthorized_access():
    """Test that the endpoint requires authentication"""
    print("\n=== STEP 5: Test Unauthorized Access ===")
    
    # Try without authentication
    fake_pool_id = "00000000-0000-0000-0000-000000000000"
    url = POOL_SPECIES_URL.format(pool_id=fake_pool_id)
    
    try:
        response = requests.get(url)
        
        if response.status_code == 401:
            print("✓ Correctly rejected unauthorized request (401)")
            return True
        else:
            print(f"✗ Expected 401, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("="*60)
    print("SPECIES API ENDPOINT TESTS")
    print("="*60)
    
    # Test public endpoint (no auth required)
    species_list = test_get_all_species()
    
    # For authenticated endpoints, we need to login
    print("\n" + "="*60)
    print("AUTHENTICATED ENDPOINT TESTS")
    print("="*60)
    
    access_token = login()
    
    if access_token:
        # Get user's pools to find a test pool
        pool_id = test_get_my_pools(access_token)
        
        if pool_id:
            # Test getting species from that pool
            test_get_pool_species(pool_id, access_token)
    
    # Test security
    test_unauthorized_access()
    
    print("\n" + "="*60)
    print("TESTS COMPLETE")
    print("="*60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
