import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, faceDescriptor } = body;

        if (!userId || !faceDescriptor) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Update user with face descriptor
        await prisma.user.update({
            where: { id: userId },
            data: {
                faceDescriptor: faceDescriptor,
                faceEnrolled: true,
                faceEnrolledAt: new Date(),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Face enrollment error:", error);
        return NextResponse.json(
            { error: "Failed to enroll face" },
            { status: 500 }
        );
    }
}
