import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  type UserAccount = {
    username : Text;
    hashedPassword : Text;
    registrationTime : Time.Time;
  };

  public type UserProfile = {
    name : Text;
    username : Text;
  };

  public type ProfileData = {
    username : Text;
    registrationTime : Time.Time;
    profile : ?UserProfile;
  };

  // Initialize access control state and include authorization mixin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userAccounts = Map.empty<Principal, UserAccount>();
  let usernameMap = Map.empty<Text, Principal>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Check if a username is unique (case-insensitive)
  func isUsernameUnique(username : Text) : Bool {
    let normalizedUsername = username.toLower().trim(#char ' ');
    not usernameMap.containsKey(normalizedUsername);
  };

  // Register a new user account - open to all (guests can register)
  public shared ({ caller }) func registerUser(username : Text, password : Text) : async () {
    if (userAccounts.containsKey(caller)) {
      Runtime.trap("This user is already registered");
    };

    let normalizedUsername = username.toLower().trim(#char ' ');
    if (not isUsernameUnique(normalizedUsername)) {
      Runtime.trap("Username already taken. Please choose a different one!");
    };

    // TODO: implement user-side password hashing
    let hashedPassword = password;
    let registrationTime = Time.now();

    let newUser : UserAccount = {
      username = normalizedUsername;
      hashedPassword;
      registrationTime;
    };

    userAccounts.add(caller, newUser);
    usernameMap.add(normalizedUsername, caller);
  };

  // Authenticate a user - open to all (guests can authenticate)
  public shared ({ caller }) func authenticateUser(username : Text, password : Text) : async Bool {
    switch (userAccounts.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?account) {
        if (account.username != username) {
          return false;
        };
        // TODO: implement user-side password hashing
        password == account.hashedPassword;
      };
    };
  };

  // Search users by username prefix - open to all including guests
  public query ({ caller }) func searchUsersByPrefix(prefix : Text) : async [Text] {
    userAccounts.values().toArray().filter(func(account) { account.username.startsWith(#text prefix) }).map(func(account) { account.username });
  };

  // Get the caller's own profile - requires user role
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  // Save the caller's own profile - requires user role
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Get another user's profile data - caller must be the user themselves or an admin
  public query ({ caller }) func getUserProfile(user : Principal) : async ?ProfileData {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    switch (userAccounts.get(user)) {
      case (null) { null };
      case (?account) {
        ?{
          username = account.username;
          registrationTime = account.registrationTime;
          profile = userProfiles.get(user);
        };
      };
    };
  };

  // Get any user's public profile data - open to all
  public query ({ caller }) func getPublicUserProfile(user : Principal) : async ?ProfileData {
    switch (userAccounts.get(user)) {
      case (null) { null };
      case (?account) {
        ?{
          username = account.username;
          registrationTime = account.registrationTime;
          profile = userProfiles.get(user);
        };
      };
    };
  };
};

