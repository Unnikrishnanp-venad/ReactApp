export const WEB_CLIENT_ID = "37313957899-av4rk8q9b3lg3kg2mq77cnc5jrj1gemq.apps.googleusercontent.com";
export const IOS_CLIENT_ID = "37313957899-88urh7ug9aam7nbq6edbmfp3pb18vhp6.apps.googleusercontent.com";
export const ANDROID_CLIENT_ID = "37313957899-2gr8klc4784b00ooar3rqmom2esqh5rt.apps.googleusercontent.com";

// Enum-like class for AsyncStorage keys
export class StorageKeys {
  static readonly STORAGE_KEY = 'FLIX_EXPENSES';
  static readonly HAS_LAUNCHED = 'hasLaunched';
  static readonly IS_AUTHED = 'isAuthed';
  static readonly SIGN_IN_TYPE = 'signInType';
  static readonly GOOGLE_USER_NAME = 'googleUserName';
  static readonly GOOGLE_USER_EMAIL = 'googleUserEmail';
  static readonly GOOGLE_USER_PHOTO = 'googleUserPhoto';
  // Add more keys as needed
}