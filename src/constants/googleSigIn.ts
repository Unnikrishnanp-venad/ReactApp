// import statusCodes along with GoogleSignin
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

export const googleSignIn = async (
  onSuccess?: () => void,
  onError?: (error: any) => void
) => {
  try {
    console.log('[GoogleSignIn] Checking Google Play Services...');
    await GoogleSignin.hasPlayServices();

    console.log('[GoogleSignIn] Checking if user has previous sign-in...');
    const hasPreviousSignIn = await GoogleSignin.hasPreviousSignIn();
    console.log('[GoogleSignIn] hasPreviousSignIn:', hasPreviousSignIn);

    if (hasPreviousSignIn) {
      console.log('[GoogleSignIn] Attempting silent sign-in...');
      signInSilently(
        () => {
          console.log('[GoogleSignIn] Silent sign-in success');
          if (onSuccess) onSuccess();
        },
        (error) => {
          console.log('[GoogleSignIn] Silent sign-in error:', error);
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            console.log('[GoogleSignIn] SIGN_IN_CANCELLED');
          } else if (error.code === statusCodes.IN_PROGRESS) {
            console.log('[GoogleSignIn] IN_PROGRESS');
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            console.log('[GoogleSignIn] PLAY_SERVICES_NOT_AVAILABLE');
          } else if (error.code === statusCodes.SIGN_IN_REQUIRED) {
            console.log('[GoogleSignIn] SIGN_IN_REQUIRED');
          } else {
            console.log('[GoogleSignIn] Unknown error:', error);
          }
        }
      );
    } else {
      console.log('[GoogleSignIn] No previous sign-in, starting normal sign-in...');
      signIn(
        () => {
          console.log('[GoogleSignIn] Normal sign-in success');
          if (onSuccess) onSuccess();
        },
        (error) => {
          console.log('[GoogleSignIn] Normal sign-in error:', error);
          if (onError) onError(error);
        }
      );
    }
  } catch (error) {
    console.log('[GoogleSignIn] Exception thrown:', error);
    if (onError) onError(error);
  }
};
// Somewhere in your code
export const signIn = async (
  onSuccess?: () => void,
  onError?: (error: any) => void
) => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    console.log("signIn response", response);
    // Parse user from Google signIn response shape
    let user = (response as any)?.user || response;
    // let user1 = JSON.stringify(user);
    // let user2 = JSON.stringify(user.data);
    // console.log("Parsed user1:", user1);
    // console.log("Parsed user2:", user2);

    // let user3 = JSON.stringify(user.data.user);
    // console.log("Parsed user3:", user3);


    if (user && user.type === "success" && user.data && user.data.user) {
      user = user.data.user;
      console.log("[signIn] Extracted user from .data.user:", user);
    }
    if (user && user.email) {
      console.log("Saving googleUserEmail:", user.email);
      await AsyncStorage.setItem("googleUserEmail", String(user.email || ""));
      console.log("Saving googleUserFamilyName:", user.familyName);
      await AsyncStorage.setItem(
        "googleUserFamilyName",
        String(user.familyName || "")
      );
      console.log("Saving googleUserGivenName:", user.givenName);
      await AsyncStorage.setItem(
        "googleUserGivenName",
        String(user.givenName || "")
      );
      console.log("Saving googleUserId:", user.id);
      await AsyncStorage.setItem("googleUserId", String(user.id || ""));
      console.log("Saving googleUserName:", user.name);
      await AsyncStorage.setItem("googleUserName", String(user.name || ""));
      console.log("Saving googleUserPhoto:", user.photo);
      await AsyncStorage.setItem("googleUserPhoto", String(user.photo || ""));
      if (onSuccess) onSuccess();
    } else if (user) {
      console.log("[signIn] User object exists but email is missing:", user);
      if (onError)
        onError(new Error("Google user info is missing or incomplete"));
    } else {
      console.log("[signIn] No user object returned from signIn:", response);
      if (onError) onError(new Error("No user object returned from signIn"));
    }
  } catch (error) {
    if (onError) onError(error);
  }
};
export const signInSilently = async (
  onSuccess?: () => void,
  onError?: (error: any) => void
) => {
  try {
    await GoogleSignin.hasPlayServices();
    const silentResponse = await GoogleSignin.signInSilently();
    console.log('[signInSilently] signInSilently response:', silentResponse);
    const user = (silentResponse as any)?.user || silentResponse;
    console.log('[signInSilently] Parsed user:', user);
    console.log('Silent response-----:', JSON.stringify(user));
    // Parse user from Google signInSilently response shape
    let parsedUser = user;
    if (user && user.type === 'success' && user.data && user.data.user) {
      parsedUser = user.data.user;
      console.log('[signInSilently] Extracted user from .data.user:', parsedUser);
    }
    if (parsedUser && parsedUser.email) {
      console.log('[signInSilently] Saving googleUserEmail:', parsedUser.email);
      await AsyncStorage.setItem("googleUserEmail", String(parsedUser.email || ""));
      console.log('[signInSilently] Saving googleUserFamilyName:', parsedUser.familyName);
      await AsyncStorage.setItem(
        "googleUserFamilyName",
        String(parsedUser.familyName || "")
      );
      console.log('[signInSilently] Saving googleUserGivenName:', parsedUser.givenName);
      await AsyncStorage.setItem(
        "googleUserGivenName",
        String(parsedUser.givenName || "")
      );
      console.log('[signInSilently] Saving googleUserId:', parsedUser.id);
      await AsyncStorage.setItem("googleUserId", String(parsedUser.id || ""));
      console.log('[signInSilently] Saving googleUserName:', parsedUser.name);
      await AsyncStorage.setItem("googleUserName", String(parsedUser.name || ""));
      console.log('[signInSilently] Saving googleUserPhoto:', parsedUser.photo);
      await AsyncStorage.setItem("googleUserPhoto", String(parsedUser.photo || ""));
      if (onSuccess) onSuccess();
    } else if (parsedUser) {
      console.log('[signInSilently] User object exists but email is missing:', parsedUser);
      if (onError)
        onError(new Error("Google user info is missing or incomplete"));
    } else {
      console.log('[signInSilently] No user object returned from signInSilently:', silentResponse);
      if (onError)
        onError(new Error("No user object returned from signInSilently"));
    }
  } catch (error) {
    console.log('[signInSilently] Error:', error);
    if (onError) onError(error);
  }
};
export const signOut = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error(error);
  }
};
export const revokeAccess = async () => {
  try {
    await GoogleSignin.revokeAccess();
  } catch (error) {
    console.error(error);
  }
};
