import { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import SimpleMDE from 'react-simplemde-editor'
import { Button, NavBar, Skeleton, Toast } from 'antd-mobile'
import { faker } from '@faker-js/faker'
import 'easymde/dist/easymde.min.css'
import useAuth from '../../hooks/useAuth'
import { Loading } from '../../global'
import {
  getDocRef,
  // getDocument,
  updateDocument,
} from '../../firebase/service'
// import { routes } from '../../routes'
import { useNavigate } from 'react-router-dom'
import { IS_MOCK } from '../../constants'

const markdown = `
## 1.	Đối tượng tham gia:
* Nhân viên ký hợp đồng chính thức (hoặc thử việc) với Groove Technology (Groover)
* Mỗi Groover chỉ được đăng ký tham gia thi đấu cho một đội duy nhất tại Giải.

## 2.	Phương thức tổ chức:
* Đội đăng ký gửi danh sách thành viên của đội về cho BTC trong thời hạn đăng ký đã quy định: Từ 31/7/2023 – 7/7/2023
* Các đội tham dự giải phải nghiêm túc chấp hành luật và điều lệ (Điều lệ bóng đá 5 người ban hành bởi Liên Đoàn Bóng đá Việt Nam) và quy định của Ban tổ chức.
* Đảm bảo trật tự, an toàn tuyệt đối cho các trận đấu.
* Đoàn kết, giao lưu, chống tư tưởng cay cú ăn thua, kiên quyết loại trừ hiện tượng bạo lực và tiêu cực trong thể thao.
* Đảm bảo phòng dịch theo quy định của bộ Y Tế và Chính Phủ về tổ chức trong thời kỳ dịch bệnh* Trọng tài do Ban tổ chức sắp xếp.

## 3.	Số lượng đăng ký tham dự:
* Mỗi đội được quyền đăng ký tối thiểu 08 và tối đa 12 Vận động viên (chưa kể HLV), có thể có Huấn luyện viên (không tham gia thi đấu). 
* Chỉ những VĐV có thông tin trùng khớp trong danh sách đăng ký mới được tham gia thi đấu. Mọi sai sót về nhân sự, các đội tự chịu trách nhiệm trước BTC.
* Trước mỗi trận đấu, quản lý đội phải đăng ký danh sách cầu thủ thi đấu và tên chỉ đạo viên để đối chiếu danh sách đăng ký, thuận tiện cho BTC kiểm tra nhân sự.
* Trang phục thi đấu phải có số rõ ràng, VĐV tham gia thi đấu phải mang giày trong suốt thời gian thi đấu.
* Số lượng các đội đăng ký tham dự Giải: 4 đội. 
* Cơ cấu đội tham dự giải:   
  *	Jupiter: 2 đội   
  *	Saturn: 1 đội   
  *	Mars + Venus: 1 đội	 

## 4.	Quy định chuyên môn
a)	Thể thức: 
* Vòng bảng: Thi đấu vòng tròn một lượt tính điểm
* Chung kết & Tranh Hạng ba: Thi đấu loại trực tiếp, nếu sau 02 hiệp thi đấu chính tỷ số hòa, sẽ thi đấu hiệp phụ (và loạt luân lưu (đá 5 quả) để xác định đội thắng.  
  - 02 Đội thứ hạng 3 & 4 vòng bảng sẽ đá trận tranh hạng Ba
  - 02 Đội thứ hạng 1 & 2 vòng bảng sẽ đá trận tranh Chung kết.

b)	Cách tính điểm và xếp hạng:
* Tính điểm:    
  - Đội thắng: 03 điểm   
  - Đội hòa: 01 điểm   
  - Đội thua: 00 điểm
 * Xếp hạng: Tính tổng số điểm của mỗi đội đạt được để xếp hạng. Nếu có từ hai đội trở lên bằng điểm nhau, thứ hạng các đội sẽ được xác định như sau: (xếp theo thứ tự ưu tiên) 
    - (1) Hiệu số giữa tổng số bàn thắng và tổng số bàn thua của cả vòng đấu. 
    - (2) Kết quả đối kháng giữa 02 đội đó. 
    - (3) Chỉ số “Fair play”: Đội nào bị ít thẻ vàng và thẻ đỏ hơn sẽ được xếp trên (1 thẻ đỏ được tính bằng 2 thẻ vàng)
    - (4) Tổng số bàn thắng của mỗi đội trong cả vòng đấu. 
    - (5) Bốc thăm. 
    
c)	Luật thi đấu: Áp dụng Luật thi đấu 05 người của FIFA*.
  * Không giới hạn số lần cầu thủ chuyền về thủ môn, tuy nhiên thủ môn không được dùng tay để chụp bóng do cầu thủ đội nhà dùng chân chuyền về, nếu đường chuyền về được thực hiện bởi các bộ phận được chấp thuận khác trên người, thủ môn có quyền chụp bóng bằng tay.
  * Tình huống bóng chết bao gồm phát bóng hết đường biên, đá biên, phạt gián tiếp cần tối thiểu 02 nhịp chạm mới được tính trong trường hợp ghi bàn (ngoại trừ phản lưới nhà)
  * Nếu trong trận đấu VĐV nào bị nhận thẻ đỏ trực tiếp sẽ bị buộc ngừng thi đấu trận đấu hiện tại và một trận kế tiếp. (đội bóng có cầu thủ đang bị thẻ đỏ sẽ thi đấu thiếu người trong 2 phút, hết 2 phút hoặc khi đội bóng có cầu thủ đang bị thẻ đỏ bị đối thủ ghi bàn sẽ được quyền thay thế cầu thủ khác).
  * Nếu trong trận đấu VĐV nào nhận hai thẻ vàng sẽ bị buộc tạm ngưng thi đấu trận đấu hiện tại.
  * Giải đấu không áp dụng cơ chế cộng dồn thẻ & phạt nguội. VĐV nhận 01 thẻ vàng trong trận đấu hiện tại, khi tham gia trận đấu tiếp theo số thẻ sẽ được tính từ 0 thẻ. (Tuy nhiên, đội vẫn phải đóng phạt tiền thẻ với số lượng thẻ tương ứng)
  * Trong trường xảy ra xô xát gây gổ đánh nhau, BTC có hình thức phạt nguội đối với cá nhân hoặc tập thể đội bóng (có thể loại ra khỏi giải). Luật này áp dụng cho tất cả vòng loại và vòng thi đấu trực tiếp.
  * Đội bóng phải tập trung trước giờ thi đấu chính thức ít nhất 15 phút để khởi động và làm thủ tục, đội bóng đi trễ 10 phút với thời gian thi đấu chính thức sẽ bị xử thua trận với tỉ số 0-3.
  * Mức phí phạt:     
    - Thẻ vàng: 50.000 VNĐ   
    - Thẻ đỏ trực tiếp: 300.000 VNĐ   
    - Mỗi đội sẽ đặt cọc tiền thẻ phạt tại BTC 500.000đ, kết thúc giải BTC sẽ hoàn trả số tiền tương ứng sau khi trừ tiền thẻ phạt. Số tiền thu được từ thẻ phạt sẽ được dành cho đội đạt giải Fairplay (ít thẻ nhất giải)
  * Trong mỗi trận đấu đội bóng được quyền đăng ký tối đa 12 VĐV (5 chính thức và 7 dự bị).
  * Thời gian thi đấu gồm 02 hiệp, mỗi hiệp 25 phút (nghỉ giữa 02 hiệp là 10 phút). Mỗi đội được quyền hội ý 02 lần trong cả trận đấu. Mỗi đội được phép hội ý 01 lần/hiệp, thời gian hội ý là 01 phút.
  * Thay người: Không giới hạn số lần thay người. Việc thay người phải được diễn ra khi bóng đang chết và có tín hiệu từ trọng tài. Cầu thủ được thay cần phải ra sân thì cầu thủ vào thay mới được vào sân.
  * Bóng chết: Các tình huống bóng chết (bóng hết biên ngang, biên dọc, phạt góc, phạt cố định, phạt đền) đều phải thực hiện dưới hình thức dùng chân đá.
  * Trang phục thi đấu: Đội tự chuẩn bị trang phục thi đấu và đăng ký cho BTC trước khi giải đấu diễn ra ít nhất 05 ngày. Trang phục của tất cả các cầu thủ phải có số áo, số áo của cầu thủ không được thay đổi trong suốt thời gian tham gia thi đấu. Màu áo thủ môn phải khác màu áo cầu thủ và trọng tài. Việc in số áo cầu thủ phải sử dụng kiểu thông dụng, dễ đọc, có màu sắc tương phản với màu sắc trang phục. Số trên quần cầu thủ (nếu có) phải giống số áo đặt ở phía trước. Các đội bóng không có trang phục thi đấu sẽ được hỗ trơ áo bid cùng màu từ BTC.
  * Mang giày đế mềm hoặc giày chuyên dụng (đinh AG hoặc TF) khi tham gia thi đấu. Các cầu thủ không mang giày hoặc mang các giày khác (đế bằng IC, giày đinh tán FG  và đinh lưỡi SG) thì không được tham gia thi đấu.
  * Đội bóng bị loại khỏi giải do vi phạm điều lệ hoặc tự ý bỏ giải sẽ bị hủy toàn bộ kết quả thi đấu với các đội liên quan.

d)	Khiếu nại & quyết định:
  * Khiếu nại:
    * Tất cả các khiếu nại về nhân sự của đội đối phương phải diễn ra trước lúc trận đấu bắt đầu.
    * Khiếu nại về tình huống trong trận đấu phải được thực hiện trong vòng 24h kể từ khi trận đấu kết thúc bằng email. BTC sẽ họp đánh giá cùng tổ trọng tài để đưa ra quyết định cuối cùng.
    * Mọi thắc mắc về công tác tổ chức giải xin liên hệ :    o Ban Tổ Chức: Mr. Nguyễn Anh Tuấn – 0984858180    o Thư ký: Ms. Võ Ngọc Đan Khuê
  * Quyết định:
    * Quyết định của BTC là quyết định cao nhất. Tất cả các đội phải tuân thủ và chấp hành.
`

const uid = 'YmkaDMxsc5cctaWNJvE3uqunXig2'

const Rules = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [value, setValue] = useState<string>()

  const handleSubmit = useCallback(async () => {
    try {
      Loading.get.show()
      const settingsData = {
        ...(value ? { rules: value } : {}),
      }
      const settingsDocRef = getDocRef('users', uid)
      await updateDocument(settingsDocRef, settingsData)
      Toast.show({
        icon: 'success',
        content: 'Saved',
      })

      return
    } catch (error: any) {
      Toast.show({
        icon: 'error',
        content: error.message,
      })
    } finally {
      Loading.get.hide()
    }
  }, [value])

  const fetchRules = useCallback(async () => {
    // const userDocRef = getDocRef('users', uid)
    // const userDocData: any = await getDocument(userDocRef)
    setValue(IS_MOCK ? faker.lorem.sentences() : markdown)
  }, [])

  useEffect(() => {
    if (typeof fetchRules !== 'function') return
    const handleFetchRules = async () => {
      try {
        await fetchRules()
        // do something
      } catch (e) {
        // navigate(routes.error)
      }
    }

    handleFetchRules()
  }, [fetchRules, navigate])

  return (
    <div>
      <NavBar className="sticky top-0 z-10 bg-bgPrimary" backArrow={false}>
        Rules
      </NavBar>
      <div className="px-4">
        {user ? (
          <div className="flex items-center">
            <SimpleMDE value={value} onChange={setValue} />
          </div>
        ) : value === undefined ? (
          <Skeleton animated className="h-screen w-full rounded-3xl" />
        ) : (
          <ReactMarkdown children={value} />
        )}
        {user ? (
          <Button
            block
            type="button"
            color="primary"
            size="large"
            shape="rounded"
            onClick={handleSubmit}
          >
            Save
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export default Rules
