import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type UserAccount = {
    username : Text;
    hashedPassword : Text;
    registrationTime : Int;
  };

  type OldActor = {
    userAccounts : Map.Map<Principal, UserAccount>;
    userProfiles : Map.Map<Principal, { name : Text; username : Text }>;
  };

  type NewActor = {
    userAccounts : Map.Map<Principal, UserAccount>;
    usernameMap : Map.Map<Text, Principal>;
    userProfiles : Map.Map<Principal, { name : Text; username : Text }>;
  };

  public func run(old : OldActor) : NewActor {
    let usernameMap = old.userAccounts.foldLeft(
      Map.empty<Text, Principal>(),
      func(map, principal, account) {
        map.add(account.username, principal);
        map;
      },
    );
    {
      old with usernameMap;
    };
  };
};
