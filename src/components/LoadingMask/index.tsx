import { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { DotLoading, Mask } from 'antd-mobile'

// eslint-disable-next-line react/display-name
const LoadingMask = forwardRef((_props, ref) => {
  const [visible, setVisible] = useState<boolean>(false)
  const init = useCallback(
    () => ({
      show: () => setVisible(true),
      hide: () => setVisible(false),
    }),
    []
  )

  useImperativeHandle(ref, init, [init])

  return (
    <Mask
      style={{
        '--z-index': '1020',
      }}
      visible={visible}
      onMaskClick={() => setVisible(false)}
    >
      <div className="flex justify-center items-center h-screen">
        <span style={{ fontSize: 24 }}>
          <DotLoading color="white" />
        </span>
      </div>
    </Mask>
  )
})

export default LoadingMask
