import InVehicleAssignmentButton from "./InVehicleAssignmentButton";
import OutVehicleAssignmentButton from "./OutVehicleAssignmentButton";
import { styled } from "styled-components";

function Footer({ dispatchIn, dispatchOut }) {
  return (
    <FooterDiv>
      <InVehicleAssignmentButton dispatchIn={dispatchIn} />
      <OutVehicleAssignmentButton dispatchOut={dispatchOut} />
    </FooterDiv>
  );
}
const FooterDiv = styled.section`
  width: 100%;
  height: 200px;
  align-content: center;
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: row;
  background: skyblue;
`;
export default Footer;
