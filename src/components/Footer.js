import VehicleAssignmentButton from "./VehicleAssignmentButton";
import { styled } from "styled-components";

function Footer({ dispatch }) {
  return (
    <FooterDiv>
      <VehicleAssignmentButton dispatch={dispatch} />
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
