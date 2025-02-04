import { useState } from "react";
import { useData } from "../../context/dataContext";

export default function Profile() {
  const { data } = useData();
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    newPassword: "",
    confirmNewPassword: "",
    password: "",
  });
  const handleChange = () => {};

  return (
    <div className="bg-gray-300 h-[calc(100vh-3.5rem)] flex flex-col items-center py-6">
      {data && (
        <>
          <h1 className="font-bold text-3xl uppercase text-gray-600">Profile</h1>
          <div className="flex flex-col w-2/4 items-center py-8">
            <div className="flex flex-col w-full">
              <div className="flex gap-2.5 my-2">
                <div className="w-1/2 flex flex-col gap-2">
                  <h3 className="font-bold text-gray-500 text-base">Nom d'utilisateur : </h3>
                  <input
                    name="username"
                    value={profileData.username}
                    placeholder={data.username.toUpperCase()}
                    onChange={handleChange}
                    className="p-2 w-full"
                  />
                </div>
                <div className="w-1/2 flex flex-col gap-2">
                  <h3 className="font-bold text-gray-500 text-base">Email : </h3>
                  <input name="email" value={profileData.email} placeholder={data.email.toUpperCase()} onChange={handleChange} className="p-2 w-full" />
                </div>
              </div>
              <div className="flex gap-2.5 my-2">
                <div className="w-1/2 flex flex-col gap-2">
                  <h3 className="font-bold text-gray-500 text-base">Nouveau mot de passe : </h3>
                  <input
                    name="newPassword"
                    type="password"
                    value={profileData.newPassword}
                    placeholder="Un nouveau mot de passe"
                    onChange={handleChange}
                    className="p-2 w-full"
                  />
                </div>
                <div className="w-1/2 flex flex-col gap-2">
                  <h3 className="font-bold text-gray-500 text-base">Confirmation du nouveau mot de passe : </h3>
                  <input
                    name="confirmNewPassword"
                    type="password"
                    value={profileData.confirmNewPassword}
                    placeholder="Confirmer le nouveau mot de passe"
                    onChange={handleChange}
                    className="p-2 w-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex self-start w-full">
              <div className="w-full flex flex-col gap-2.5">
                <h3 className="font-bold text-gray-500 text-base">Mot de passe ( Obligatoire ) : </h3>
                <input
                  name="password"
                  type="password"
                  value={profileData.password}
                  placeholder="Votre mot de passe actuel"
                  onChange={handleChange}
                  className="p-2 w-full"
                />
              </div>
            </div>
            <div className="flex w-full">
              <button className="w-full p-4 text-gray-300 font-bold border border-gray-500 bg-gray-500 hover:bg-gray-300 hover:text-gray-500 my-4 rounded-md" onClick={() => {}}>
                Sauvegarder
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
