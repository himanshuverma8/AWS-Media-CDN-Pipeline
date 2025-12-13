import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateUser, generateApiCredentials, getApiCredentials, revokeApiCredentials
 } from "@/lib/db";

 //get api credentials 
 export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if(!session?.user?.email) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    try {
        const user = await getOrCreateUser(
            session.user.email,
            session.user.name || 'User'
        );

        if (!user) {
            return NextResponse.json(
                {error: 'Failed to get or create user'},
                {status: 500}
            );
        }

        const credentials = await getApiCredentials(user.id);

        return NextResponse.json({
            success: true,
            apiKey: credentials?.apiKey || null,
            hasSecret: !!credentials?.apiSecret
        })
    } catch (error) {
        return NextResponse.json(
            {error: 'Failed to get credentials'},
            {status: 500}
        );
    }
 }

 //post generate new api credentials
 export async function POST(request:NextRequest) {
    const session = await getServerSession(authOptions);
    if(!session?.user?.email) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    try {
        const user = await getOrCreateUser(
            session.user.email,
            session.user.name || 'User'
        );

        if (!user) {
            return NextResponse.json(
                {error: 'Failed to get or create user'},
                {status: 500}
            );
        }

        const { apiKey, apiSecret} = await generateApiCredentials(user.id);

        //return both key and secret (only one time secret is shown)
        return NextResponse.json({
            success: true,
            apiKey,
            apiSecret,
            message: 'Save your api secret securely. It will not be shown again.',
        });
    } catch (error) {
        return NextResponse.json(
            {error: 'Failed to generate credentials'},
            {status: 500}
        );
    }
 }

 //delete -> revoke api credentials
 export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if(!session?.user?.email){
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    try {
        const user = await getOrCreateUser(
            session.user.email,
            session.user.name || 'User'
        );

        if (!user) {
            return NextResponse.json(
                {error: 'Failed to get or create user'},
                {status: 500}
            );
        }

        await revokeApiCredentials(user.id);

        return NextResponse.json({
            success: true,
            message: 'API credentials revoked successfully',
        }); 
    } catch (error) {
        return NextResponse.json(
            {error: 'Failed to revoke credentials'},
            {status: 500}
        )
    }
    
 }