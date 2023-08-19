// https://www.javascripttutorial.net/javascript-apply-method/
// https://bobbyhadz.com/blog/javascript-remove-null-values-from-array
// https://stackoverflow.com/questions/70571720/firestore-query-snapshot-foreach-seems-to-be-overwriting-products-state
// https://stackoverflow.com/questions/50807905/are-firestore-updates-charged-the-same-cost-as-writes
// https://stackoverflow.com/questions/37811684/how-to-create-credential-object-needed-by-firebase-web-user-reauthenticatewith
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  UserCredential,
  updateProfile,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  writeBatch,
  collectionGroup,
  DocumentReference,
  DocumentData,
  CollectionReference,
} from 'firebase/firestore'

import { auth, db } from '.'

export const addDocument = async (
  ref:
    | DocumentReference<unknown, DocumentData>
    | CollectionReference<unknown, DocumentData>,
  data = {}
) => {
  const formatData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  switch (ref.type) {
    case 'document': {
      const docRef = await setDoc(ref, formatData)
      return docRef
    }
    case 'collection': {
      const docRef = await addDoc(ref, formatData)
      return docRef
    }
    default: {
      return
    }
  }
}

export const getDocument = async (
  ref: DocumentReference<unknown, DocumentData>
) => {
  const docSnap = await getDoc(ref)

  if (docSnap.exists()) {
    // console.log('Document data:', docSnap.data())
    return docSnap.data()
  } else {
    // doc.data() will be undefined in this case
    // console.log('No such document!')
    throw Error('No such document!')
  }
}

export const updateDocument = async (
  ref: DocumentReference<unknown, DocumentData>,
  data = {}
) => {
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export const getDocRef = (
  collectionName = 'todos',
  ...pathSegments: string[]
) => doc(db, collectionName, ...pathSegments)

export const getColRef = (
  collectionName = 'todos',
  ...pathSegments: string[]
) => collection(db, collectionName, ...pathSegments)

export const getColGroupRef = (collectionName = 'todos') =>
  collectionGroup(db, collectionName)

export const deleteDocument = async (
  collectionName = 'todos',
  ...pathSegments: string[]
) => {
  const docRef = getDocRef(collectionName, ...pathSegments)
  await deleteDoc(docRef)
}

export const getBatch = () => writeBatch(db)

export const signInWithEmailAndPasswordFirebase = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, password)
}

export const createUserWithEmailAndPasswordFirebase = async (
  email: string,
  password: string
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )
  return userCredential
}

export const fetchSignInMethodsForEmailFirebase = async (email: string) => {
  const providers = await fetchSignInMethodsForEmail(auth, email)
  return providers
}

export const signOutFirebase = async () => await signOut(auth)

export const reauthenticateWithCredentialFirebase = async (
  currentPassword: string
) => {
  // TODO(you): prompt the user to re-provide their sign-in credentials
  const user = auth.currentUser
  if (user === null || user.email === null) return
  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  return await reauthenticateWithCredential(user, credential)
}

export const updatePasswordFirebase = async (newPassword: string) => {
  const user = auth.currentUser
  if (user === null) return
  return await updatePassword(user, newPassword)
}

export const updateProfileFirebase = async (profile: {
  displayName?: string | null | undefined
  photoURL?: string | null | undefined
}) => {
  const user = auth.currentUser
  if (user === null) return
  return await updateProfile(user, profile)
}

export const setCache = async (...pathSegments: string[]) => {
  await setDoc(getDocRef('caches', ...pathSegments), {
    updatedAt: serverTimestamp(),
  })
}
