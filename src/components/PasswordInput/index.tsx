import { useState } from "react";
import { Input } from "antd-mobile";
import { EyeInvisibleOutline, EyeOutline } from "antd-mobile-icons";

const PasswordInput = (props: any) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex items-center [&_input]:flex-auto">
      <Input type={visible ? "text" : "password"} {...props} />
      <div className="flex-none ml-2 p-1 cursor-pointer [&_svg]:block [&_svg]:font-[font-size: var(--adm-font-size-7)]">
        {!visible ? (
          <EyeInvisibleOutline onClick={() => setVisible(true)} />
        ) : (
          <EyeOutline onClick={() => setVisible(false)} />
        )}
      </div>
    </div>
  );
};

export default PasswordInput;
