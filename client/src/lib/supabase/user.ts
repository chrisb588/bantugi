import { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "./server";
import UserAuthDetails from "@/interfaces/user-auth";
import User from "@/interfaces/user";

export async function userSignUp(payload: UserAuthDetails) {
    const supabase : SupabaseClient = await createServerClient();

    const {data : signupData, error: signUpError} = await supabase.auth.signUp({
        email: payload.username,
        password: payload.password
    })

    if (signUpError) {
        console.error("Error while signing up:", signUpError);
        return;
    }

    const userId = signupData?.user?.id;

    const { data: Profile, error: profileError} = await supabase
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

export async function getUserID() {
    const supabase : SupabaseClient = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (user) {
    const userId = user.id;
    console.log('Current user ID:', userId);
    }

}

export async function signInWithPassword(payload: UserAuthDetails) {
    const supabase : SupabaseClient = await createServerClient();
    const { data : { user }, error : signInError} = await supabase.auth.signInWithPassword({
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

