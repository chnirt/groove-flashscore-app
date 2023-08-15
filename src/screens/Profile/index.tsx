import { Dialog, Footer, List, NavBar } from 'antd-mobile'
import { useCallback, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import { signOutFirebase, updateProfileFirebase } from '../../firebase/service'
import { Loading } from '../../global'
import AvatarUploader from '../../components/AvatarUploader'

const Profile = () => {
  const { user } = useAuth()
  const [photoURL, setPhotoURL] = useState(user?.photoURL ?? '')
  const handleLogout = useCallback(() => {
    Dialog.confirm({
      content: 'Are you sure want to log out?',
      cancelText: 'Cancel',
      confirmText: 'Log out',
      onConfirm: async () => {
        Loading.get.show()
        signOutFirebase()
        // const logoutFromAPI = async () => {
        //   const data: boolean = await new Promise((resolve) =>
        //     setTimeout(() => resolve(true), 1000)
        //   );
        //   return data;
        // };
        // logout(logoutFromAPI);
      },
    })
  }, [])
  const handleOnUpload = useCallback(async (downloadURL: string) => {
    await updateProfileFirebase({
      photoURL: downloadURL,
    })
    setPhotoURL(downloadURL)
  }, [])
  return (
    <div>
      <NavBar className="sticky top-0 z-10 bg-bgPrimary" backArrow={false}>
        Me
      </NavBar>

      <List mode="card">
        <List.Item
          prefix={
            <AvatarUploader photoURL={photoURL} onUpload={handleOnUpload} />
          }
          description={user?.email}
        >
          {user?.fullName}
        </List.Item>
        <List.Item onClick={handleLogout} arrow={false}>
          Log out
        </List.Item>
        <List.Item arrow={false}>
          <Footer content="@ 2004-2023 https://groovetechnology.com All rights reserved"></Footer>
        </List.Item>
      </List>
    </div>
  )
}

export default Profile
