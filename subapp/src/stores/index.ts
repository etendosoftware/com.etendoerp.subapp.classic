import User from "./User";
import Windows from "./Windows";

async function logout() {
  await User.logout();
  Windows.unloadWindows();
}

export { User, Windows, logout };
