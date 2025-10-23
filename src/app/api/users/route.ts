import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const department = searchParams.get("department");

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && role !== "ALL") {
      where.role = role;
    }

    if (department && department !== "ALL") {
      where.department = department;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            sentApprovals: true,
            firstLayerReviews: true,
            secondLayerReviews: true,
            thirdLayerReviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, role, department } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        department,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
