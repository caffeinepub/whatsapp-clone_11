import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type UserAccount = {
    username : Text;
    hashedPassword : Text;
  };

  public type UserProfile = {
    name : Text;
    username : Text;
  };

  // Initialize access control state and include authorization mixin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userAccounts = Map.empty<Principal, UserAccount>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Register a new user account - open to all (guests can register)
  public shared ({ caller }) func registerUser(username : Text, password : Text) : async () {
    if (userAccounts.containsKey(caller)) {
      Runtime.trap("This user is already registered");
    };

    let hashedPassword = password; // TODO: implement user-side password hashing

    let newUser : UserAccount = {
      username;
      hashedPassword;
    };

    userAccounts.add(caller, newUser);
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

  // Get another user's profile - caller must be the user themselves or an admin
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };
};
