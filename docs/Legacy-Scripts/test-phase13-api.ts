/**
 * Phase 13 API Testing Script
 * Tests all cross-reference system endpoints (admin and public)
 * 
 * Run: npx tsx scripts/test-phase13-api.ts
 */

import { prisma } from '../src/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function log(message: string) {
  console.log(`[TEST] ${message}`);
}

function logSuccess(test: string, details?: string) {
  const result: TestResult = { test, status: 'PASS', details };
  results.push(result);
  console.log(`✅ ${test}${details ? `: ${details}` : ''}`);
}

function logFailure(test: string, error: string) {
  const result: TestResult = { test, status: 'FAIL', error };
  results.push(result);
  console.error(`❌ ${test}: ${error}`);
}

async function makeRequest(
  method: string,
  path: string,
  body?: Record<string, unknown>,
  headers: Record<string, string> = {}
) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  return { response, data };
}

async function testCrossReferences(partId: string, adminToken: string) {
  log('\n=== Testing Cross-References Endpoints ===');

  let createdRefId: string | null = null;

  // Test 1: Create cross-reference
  try {
    const { response, data } = await makeRequest(
      'POST',
      `/api/admin/parts/${partId}/cross-references`,
      {
        referenceType: 'alternative',
        brandName: 'Test Brand',
        partNumber: 'TB-12345',
        notes: 'Test cross-reference',
      },
      { Authorization: `Bearer ${adminToken}` }
    );

    if (response.ok && data.success && data.data?.id) {
      createdRefId = data.data.id;
      logSuccess('Create cross-reference', `ID: ${createdRefId}`);
    } else {
      logFailure('Create cross-reference', JSON.stringify(data));
    }
  } catch (error) {
    logFailure('Create cross-reference', error instanceof Error ? error.message : 'Unknown error');
  }

  // Test 2: List cross-references
  try {
    const { response, data } = await makeRequest(
      'GET',
      `/api/admin/parts/${partId}/cross-references`,
      undefined,
      { Authorization: `Bearer ${adminToken}` }
    );

    if (response.ok && data.success && Array.isArray(data.data)) {
      logSuccess('List cross-references', `Found ${data.data.length} records`);
    } else {
      logFailure('List cross-references', JSON.stringify(data));
    }
  } catch (error) {
    logFailure('List cross-references', error instanceof Error ? error.message : 'Unknown error');
  }

  // Test 3: Update cross-reference
  if (createdRefId) {
    try {
      const { response, data } = await makeRequest(
        'PUT',
        `/api/admin/parts/${partId}/cross-references/${createdRefId}`,
        {
          referenceType: 'supersedes',
          brandName: 'Updated Brand',
          partNumber: 'UB-67890',
          notes: 'Updated notes',
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      if (response.ok && data.success && data.data?.id === createdRefId) {
        logSuccess('Update cross-reference', 'Successfully updated');
      } else {
        logFailure('Update cross-reference', JSON.stringify(data));
      }
    } catch (error) {
      logFailure('Update cross-reference', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Test 4: Delete cross-reference
  if (createdRefId) {
    try {
      const { response, data } = await makeRequest(
        'DELETE',
        `/api/admin/parts/${partId}/cross-references/${createdRefId}`,
        undefined,
        { Authorization: `Bearer ${adminToken}` }
      );

      if (response.ok && data.success) {
        logSuccess('Delete cross-reference', 'Successfully deleted');
      } else {
        logFailure('Delete cross-reference', JSON.stringify(data));
      }
    } catch (error) {
      logFailure('Delete cross-reference', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Test 5: Error case - Invalid validation
  try {
    const { response, data } = await makeRequest(
      'POST',
      `/api/admin/parts/${partId}/cross-references`,
      {
        referenceType: 'invalid_type', // Invalid reference type
        brandName: 'Test',
        partNumber: 'TEST-123',
      },
      { Authorization: `Bearer ${adminToken}` }
    );

    if (response.status === 400 && !data.success) {
      logSuccess('Cross-reference validation error', 'Correctly rejected invalid data');
    } else {
      logFailure('Cross-reference validation error', 'Should have returned 400 error');
    }
  } catch (error) {
    logFailure('Cross-reference validation error', error instanceof Error ? error.message : 'Unknown error');
  }
}

async function testOEMNumbers(partId: string, adminToken: string) {
  log('\n=== Testing OEM Numbers Endpoints ===');

  let createdOEMId: string | null = null;

  // Test 1: Create OEM number
  try {
    const { response, data } = await makeRequest(
      'POST',
      `/api/admin/parts/${partId}/oem-numbers`,
      {
        manufacturer: 'Toyota',
        oemPartNumber: 'TOY-12345',
        notes: 'Test OEM number',
      },
      { Authorization: `Bearer ${adminToken}` }
    );

    if (response.ok && data.success && data.data?.id) {
      createdOEMId = data.data.id;
      logSuccess('Create OEM number', `ID: ${createdOEMId}`);
    } else {
      logFailure('Create OEM number', JSON.stringify(data));
    }
  } catch (error) {
    logFailure('Create OEM number', error instanceof Error ? error.message : 'Unknown error');
  }

  // Test 2: List OEM numbers
  try {
    const { response, data } = await makeRequest(
      'GET',
      `/api/admin/parts/${partId}/oem-numbers`,
      undefined,
      { Authorization: `Bearer ${adminToken}` }
    );

    if (response.ok && data.success && Array.isArray(data.data)) {
      logSuccess('List OEM numbers', `Found ${data.data.length} records`);
    } else {
      logFailure('List OEM numbers', JSON.stringify(data));
    }
  } catch (error) {
    logFailure('List OEM numbers', error instanceof Error ? error.message : 'Unknown error');
  }

  // Test 3: Update OEM number
  if (createdOEMId) {
    try {
      const { response, data } = await makeRequest(
        'PUT',
        `/api/admin/parts/${partId}/oem-numbers/${createdOEMId}`,
        {
          manufacturer: 'Honda',
          oemPartNumber: 'HON-67890',
          notes: 'Updated OEM notes',
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      if (response.ok && data.success && data.data?.id === createdOEMId) {
        logSuccess('Update OEM number', 'Successfully updated');
      } else {
        logFailure('Update OEM number', JSON.stringify(data));
      }
    } catch (error) {
      logFailure('Update OEM number', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Test 4: Delete OEM number
  if (createdOEMId) {
    try {
      const { response, data } = await makeRequest(
        'DELETE',
        `/api/admin/parts/${partId}/oem-numbers/${createdOEMId}`,
        undefined,
        { Authorization: `Bearer ${adminToken}` }
      );

      if (response.ok && data.success) {
        logSuccess('Delete OEM number', 'Successfully deleted');
      } else {
        logFailure('Delete OEM number', JSON.stringify(data));
      }
    } catch (error) {
      logFailure('Delete OEM number', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Test 5: Duplicate OEM number (unique constraint)
  try {
    // Create first OEM
    const { data: firstOEM } = await makeRequest(
      'POST',
      `/api/admin/parts/${partId}/oem-numbers`,
      {
        manufacturer: 'Nissan',
        oemPartNumber: 'NIS-11111',
      },
      { Authorization: `Bearer ${adminToken}` }
    );

    if (firstOEM.success) {
      // Try to create duplicate
      const { response, data } = await makeRequest(
        'POST',
        `/api/admin/parts/${partId}/oem-numbers`,
        {
          manufacturer: 'Nissan',
          oemPartNumber: 'NIS-11111', // Duplicate
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      if (response.status === 400 && !data.success) {
        logSuccess('OEM unique constraint', 'Correctly rejected duplicate');
      } else {
        logFailure('OEM unique constraint', 'Should have returned 400 error');
      }

      // Cleanup
      if (firstOEM.data?.id) {
        await makeRequest(
          'DELETE',
          `/api/admin/parts/${partId}/oem-numbers/${firstOEM.data.id}`,
          undefined,
          { Authorization: `Bearer ${adminToken}` }
        );
      }
    }
  } catch (error) {
    logFailure('OEM unique constraint', error instanceof Error ? error.message : 'Unknown error');
  }
}

async function testVehicleCompatibility(partId: string, adminToken: string) {
  log('\n=== Testing Vehicle Compatibility Endpoints ===');

  let createdCompatId: string | null = null;

  // Test 1: Create vehicle compatibility
  try {
    const { response, data } = await makeRequest(
      'POST',
      `/api/admin/parts/${partId}/vehicle-compatibility`,
      {
        make: 'Toyota',
        model: 'Camry',
        yearStart: 2015,
        yearEnd: 2020,
        engine: '2.5L I4',
        trim: 'LE',
        position: 'Front',
        notes: 'Test compatibility',
      },
      { Authorization: `Bearer ${adminToken}` }
    );

    if (response.ok && data.success && data.data?.id) {
      createdCompatId = data.data.id;
      logSuccess('Create vehicle compatibility', `ID: ${createdCompatId}`);
    } else {
      logFailure('Create vehicle compatibility', JSON.stringify(data));
    }
  } catch (error) {
    logFailure('Create vehicle compatibility', error instanceof Error ? error.message : 'Unknown error');
  }

  // Test 2: List vehicle compatibility
  try {
    const { response, data } = await makeRequest(
      'GET',
      `/api/admin/parts/${partId}/vehicle-compatibility`,
      undefined,
      { Authorization: `Bearer ${adminToken}` }
    );

    if (response.ok && data.success && Array.isArray(data.data)) {
      logSuccess('List vehicle compatibility', `Found ${data.data.length} records`);
    } else {
      logFailure('List vehicle compatibility', JSON.stringify(data));
    }
  } catch (error) {
    logFailure('List vehicle compatibility', error instanceof Error ? error.message : 'Unknown error');
  }

  // Test 3: Update vehicle compatibility
  if (createdCompatId) {
    try {
      const { response, data } = await makeRequest(
        'PUT',
        `/api/admin/parts/${partId}/vehicle-compatibility/${createdCompatId}`,
        {
          make: 'Honda',
          model: 'Accord',
          yearStart: 2018,
          yearEnd: 2023,
          engine: '1.5L Turbo',
          trim: 'Sport',
          position: 'Rear',
          notes: 'Updated compatibility',
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      if (response.ok && data.success && data.data?.id === createdCompatId) {
        logSuccess('Update vehicle compatibility', 'Successfully updated');
      } else {
        logFailure('Update vehicle compatibility', JSON.stringify(data));
      }
    } catch (error) {
      logFailure('Update vehicle compatibility', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Test 4: Delete vehicle compatibility
  if (createdCompatId) {
    try {
      const { response, data } = await makeRequest(
        'DELETE',
        `/api/admin/parts/${partId}/vehicle-compatibility/${createdCompatId}`,
        undefined,
        { Authorization: `Bearer ${adminToken}` }
      );

      if (response.ok && data.success) {
        logSuccess('Delete vehicle compatibility', 'Successfully deleted');
      } else {
        logFailure('Delete vehicle compatibility', JSON.stringify(data));
      }
    } catch (error) {
      logFailure('Delete vehicle compatibility', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Test 5: Invalid year range
  try {
    const { response, data } = await makeRequest(
      'POST',
      `/api/admin/parts/${partId}/vehicle-compatibility`,
      {
        make: 'Ford',
        model: 'F-150',
        yearStart: 2020,
        yearEnd: 2015, // Invalid: yearEnd < yearStart
      },
      { Authorization: `Bearer ${adminToken}` }
    );

    if (response.status === 400 && !data.success) {
      logSuccess('Vehicle year range validation', 'Correctly rejected invalid year range');
    } else {
      logFailure('Vehicle year range validation', 'Should have returned 400 error');
    }
  } catch (error) {
    logFailure('Vehicle year range validation', error instanceof Error ? error.message : 'Unknown error');
  }
}

async function testPublicAPI(productSlug: string) {
  log('\n=== Testing Public Product API ===');

  try {
    const { response, data } = await makeRequest('GET', `/api/public/showcase/products/${productSlug}`);

    if (response.ok && data.success) {
      const product = data.data;

      // Check if cross-references are included
      if (Array.isArray(product.crossReferences)) {
        logSuccess('Public API - Cross-references', `Included ${product.crossReferences.length} records`);
      } else {
        logFailure('Public API - Cross-references', 'Not included in response');
      }

      // Check if OEM numbers are included
      if (Array.isArray(product.oemPartNumbers)) {
        logSuccess('Public API - OEM numbers', `Included ${product.oemPartNumbers.length} records`);
      } else {
        logFailure('Public API - OEM numbers', 'Not included in response');
      }

      // Check if vehicle compatibility is included
      if (Array.isArray(product.vehicleCompatibility)) {
        logSuccess('Public API - Vehicle compatibility', `Included ${product.vehicleCompatibility.length} records`);
      } else {
        logFailure('Public API - Vehicle compatibility', 'Not included in response');
      }
    } else {
      logFailure('Public API', JSON.stringify(data));
    }
  } catch (error) {
    logFailure('Public API', error instanceof Error ? error.message : 'Unknown error');
  }
}

async function testNotFoundErrors(adminToken: string) {
  log('\n=== Testing 404 Errors ===');

  const invalidPartId = '00000000-0000-0000-0000-000000000000';

  // Test cross-reference 404
  try {
    const { response, data } = await makeRequest(
      'GET',
      `/api/admin/parts/${invalidPartId}/cross-references`,
      undefined,
      { Authorization: `Bearer ${adminToken}` }
    );

    if (response.status === 404 && !data.success) {
      logSuccess('404 - Cross-references (invalid part)', 'Correctly returned 404');
    } else {
      logFailure('404 - Cross-references (invalid part)', 'Should have returned 404');
    }
  } catch (error) {
    logFailure('404 - Cross-references (invalid part)', error instanceof Error ? error.message : 'Unknown error');
  }

  // Test OEM numbers 404
  try {
    const { response, data } = await makeRequest(
      'GET',
      `/api/admin/parts/${invalidPartId}/oem-numbers`,
      undefined,
      { Authorization: `Bearer ${adminToken}` }
    );

    if (response.status === 404 && !data.success) {
      logSuccess('404 - OEM numbers (invalid part)', 'Correctly returned 404');
    } else {
      logFailure('404 - OEM numbers (invalid part)', 'Should have returned 404');
    }
  } catch (error) {
    logFailure('404 - OEM numbers (invalid part)', error instanceof Error ? error.message : 'Unknown error');
  }

  // Test vehicle compatibility 404
  try {
    const { response, data } = await makeRequest(
      'GET',
      `/api/admin/parts/${invalidPartId}/vehicle-compatibility`,
      undefined,
      { Authorization: `Bearer ${adminToken}` }
    );

    if (response.status === 404 && !data.success) {
      logSuccess('404 - Vehicle compatibility (invalid part)', 'Correctly returned 404');
    } else {
      logFailure('404 - Vehicle compatibility (invalid part)', 'Should have returned 404');
    }
  } catch (error) {
    logFailure('404 - Vehicle compatibility (invalid part)', error instanceof Error ? error.message : 'Unknown error');
  }
}

async function main() {
  console.log('🚀 Phase 13 API Testing Script\n');
  console.log(`Testing against: ${BASE_URL}\n`);

  try {
    // Get a test part and admin token
    const testPart = await prisma.part.findFirst({
      where: { published: true },
    });

    if (!testPart) {
      console.error('❌ No published parts found. Please create a test part first.');
      process.exit(1);
    }

    log(`Using test part: ${testPart.name} (${testPart.id})`);
    log(`Using test slug: ${testPart.slug}`);

    // For testing, we'll need an admin token
    // Note: This is a placeholder - in real testing, you'd need to get a valid Clerk token
    const adminToken = process.env.ADMIN_TEST_TOKEN || 'test-token';

    if (adminToken === 'test-token') {
      console.warn('\n⚠️  WARNING: Using placeholder admin token. Set ADMIN_TEST_TOKEN environment variable for real testing.\n');
    }

    // Run all tests
    await testCrossReferences(testPart.id, adminToken);
    await testOEMNumbers(testPart.id, adminToken);
    await testVehicleCompatibility(testPart.id, adminToken);
    await testPublicAPI(testPart.slug);
    await testNotFoundErrors(adminToken);

    // Print summary
    log('\n=== Test Summary ===');
    const passedTests = results.filter((r) => r.status === 'PASS').length;
    const failedTests = results.filter((r) => r.status === 'FAIL').length;

    console.log(`\nTotal Tests: ${results.length}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);

    if (failedTests > 0) {
      console.log('\nFailed Tests:');
      results
        .filter((r) => r.status === 'FAIL')
        .forEach((r) => {
          console.log(`  - ${r.test}: ${r.error}`);
        });
    }

    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
