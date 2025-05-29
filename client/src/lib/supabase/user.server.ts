import { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "./server";
import UserAuthDetails from "@/interfaces/user-auth";
import User from "@/interfaces/user";

export async function userSignUp(server: SupabaseClient, payload: UserAuthDetails) {

    const {data : signupData, error: signUpError} = await server.auth.signUp({
        email: payload.username,
        password: payload.password
    })

    if (signUpError) {
        console.error("Error while signing up:", signUpError);
        return;
    }

    const userId = signupData?.user?.id;

    const { data: Profile, error: profileError} = await server
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single()

    if (profileError) {
        console.error("Error while retrieving:", profileError);
        return;
    }

    // return user
    return Profile as User
}

export async function getUserID(server: SupabaseClient) {
    try {
        // First try to get the session to ensure we have a valid auth context
        const { data: { session }, error: sessionError } = await server.auth.getSession();
        
        if (sessionError) {
            console.warn('Session error in getUserID:', sessionError.message);
            return null;
        }

        if (!session) {
            console.log('No active session found in getUserID');
            return null;
        }

        // Now get the user with the session context
        const { data: { user }, error } = await server.auth.getUser();

        if (error) {
            console.error('Error getting user:', error.message);
            return null;
        }

        if (user) {
            return user.id;
        }
        
        return null;
    } catch (error: any) {
        console.error('Unexpected error in getUserID:', error.message);
        return null;
    }
}

export async function signInWithPassword(server: SupabaseClient, payload: UserAuthDetails) {
    const { data : { user }, error : signInError} = await server.auth.signInWithPassword({
        email: payload.username,
        password: payload.password,        
    });

    if (signInError) {
        console.error(" Error when signing in:", signInError);
        return;
    }

    if (user) {
        const userId = user.id
        console.log('Logged in as user ID:', userId)
        return user
    } 
}

