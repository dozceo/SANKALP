
import { performance } from 'perf_hooks';

// Mock objects
const mockTeacher = {
    id: 'teacher123',
    name: 'Mr. Smith',
    onboardingCompleted: true,
    email: 'smith@school.com',
    school: 'High School',
    subject: 'Math',
    classIds: []
};

// Mock dependencies
const getTeacher = async (id: string) => {
    // Simulate slight async delay if needed, but for CPU benchmark synchronous return or microtask is better
    // to isolate the logging cost.
    return mockTeacher;
};

// Mock NextRequest
class MockNextRequest {
    url: string;
    constructor(url: string) {
        this.url = url;
    }
}

// Mock NextResponse
const NextResponse = {
    json: (body: any, options?: any) => {
        return { body, options };
    }
};

// Original Handler Logic (with logging)
async function handlerWithLogging(req: any) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get('teacherId');

        console.log('[Teacher API] GET request for teacherId:', teacherId);

        if (!teacherId || teacherId === 'undefined') {
            console.error('[Teacher API] Invalid or missing teacherId');
            return NextResponse.json(
                { error: 'Missing teacherId' },
                { status: 400 }
            );
        }

        const teacher = await getTeacher(teacherId);
        console.log('[Teacher API] Teacher fetched:', teacher ? 'Found' : 'Not found');

        if (!teacher) {
            console.log('[Teacher API] Teacher not found in DB for ID:', teacherId);
            return NextResponse.json({
                success: true,
                teacher: null,
            });
        }

        console.log('[Teacher API] Returning teacher data:', {
            id: teacher.id,
            name: teacher.name,
            onboardingCompleted: teacher.onboardingCompleted
        });

        return NextResponse.json({
            success: true,
            teacher,
        });
    } catch (error) {
        console.error('[Teacher API] Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// Optimized Handler Logic (without logging)
async function handlerWithoutLogging(req: any) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get('teacherId');

        // console.log('[Teacher API] GET request for teacherId:', teacherId);

        if (!teacherId || teacherId === 'undefined') {
            console.error('[Teacher API] Invalid or missing teacherId');
            return NextResponse.json(
                { error: 'Missing teacherId' },
                { status: 400 }
            );
        }

        const teacher = await getTeacher(teacherId);
        // console.log('[Teacher API] Teacher fetched:', teacher ? 'Found' : 'Not found');

        if (!teacher) {
            // console.log('[Teacher API] Teacher not found in DB for ID:', teacherId);
            return NextResponse.json({
                success: true,
                teacher: null,
            });
        }

        // console.log('[Teacher API] Returning teacher data:', {
        //     id: teacher.id,
        //     name: teacher.name,
        //     onboardingCompleted: teacher.onboardingCompleted
        // });

        return NextResponse.json({
            success: true,
            teacher,
        });
    } catch (error) {
        console.error('[Teacher API] Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

async function runBenchmark() {
    const iterations = 50000;
    const req = new MockNextRequest('http://localhost/api/teacher?teacherId=teacher123');

    // Warmup
    for (let i = 0; i < 100; i++) await handlerWithLogging(req);
    for (let i = 0; i < 100; i++) await handlerWithoutLogging(req);

    console.error(`Running benchmark with ${iterations} iterations...`);

    const start1 = performance.now();
    for (let i = 0; i < iterations; i++) {
        await handlerWithLogging(req);
    }
    const end1 = performance.now();
    const timeWithLogging = end1 - start1;

    const start2 = performance.now();
    for (let i = 0; i < iterations; i++) {
        await handlerWithoutLogging(req);
    }
    const end2 = performance.now();
    const timeWithoutLogging = end2 - start2;

    const improvement = timeWithLogging / timeWithoutLogging;

    console.error(`\nResults (${iterations} iterations):`);
    console.error(`With Logging:    ${timeWithLogging.toFixed(2)}ms`);
    console.error(`Without Logging: ${timeWithoutLogging.toFixed(2)}ms`);
    console.error(`Speedup:         ${improvement.toFixed(2)}x`);
}

runBenchmark();
