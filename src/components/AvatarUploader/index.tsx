import { useCallback } from "react";
import { Avatar, ImageUploadItem } from "antd-mobile";
import { uploadStorageBytesResumable } from "../../firebase/storage";

const AvatarUploader = ({
  photoURL = "",
  onUpload,
}: {
  photoURL: string;
  onUpload: (downloadURL: string) => void;
}) => {
  const upload = useCallback((file: File): Promise<ImageUploadItem> => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      return Promise.reject(new Error("You can only upload JPG/PNG file!"));
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      return Promise.reject(new Error("Image must smaller than 2MB!"));
    }

    return new Promise((resolve, reject) => {
      uploadStorageBytesResumable(
        file,
        undefined,
        (error) => reject(error),
        async ({ downloadURL }) => {
          typeof onUpload === "function" ? onUpload(downloadURL) : undefined;
          resolve({
            url: downloadURL,
          });
        },
      );
    });
  }, []);
  return (
    <div>
      <label htmlFor="file-input">
        <Avatar src={photoURL} />
      </label>
      <input
        id="file-input"
        className="hidden"
        type="file"
        onChange={async (e) => {
          if (e.target.files) {
            await upload(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};

export default AvatarUploader;
