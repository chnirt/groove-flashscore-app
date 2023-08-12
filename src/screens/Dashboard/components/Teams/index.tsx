import { CapsuleTabs } from "antd-mobile";
import { ITeams } from "../../../../mocks";

const Teams = ({ data }: { data: ITeams }) => {
  if (data.length === 0) return null;
  return (
    <CapsuleTabs>
      {data.map((team) => (
        <CapsuleTabs.Tab key={team.id} title={team.name} />
      ))}
    </CapsuleTabs>
  );
};

export default Teams;
