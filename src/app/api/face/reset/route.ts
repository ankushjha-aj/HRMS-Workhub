import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: "Missing userId" },
                { status: 400 }
            );
        }

        // Reset face data
        await prisma.user.update({
            where: { id: userId },
            data: {
                faceDescriptor: Prisma.DbNull, // Clear descriptor
                faceEnrolled: false,  // Mark as not enrolled
                faceEnrolledAt: null,
            },
        });

        return NextResponse.json({ success: true, message: "Face data reset successfully" });
    } catch (error) {
        console.error("Face reset error:", error);
        return NextResponse.json(
            { error: "Failed to reset face data" },
            { status: 500 }
        );
    }
}
