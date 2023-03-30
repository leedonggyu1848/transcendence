import styled from "@emotion/styled";

const Menu = () => {
  return (
    <MenuContainer>
      <Logo />
      <NavContainer>
        <IconConatiner>
          <Game />
          <Chat />
          <History />
        </IconConatiner>
        <Setting />
      </NavContainer>
    </MenuContainer>
  );
};

const IconConatiner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Logo = styled.div`
  background-image: url("/src/assets/42Logo.png");
  background-size: 100% 100%;
  width: 60px;
  height: 60px;
  cursor: pointer;
`;
const Game = styled.div`
  width: 40px;
  height: 40px;
  background-image: url("/src/assets/PongIcon.png");
  background-size: 100% 100%;
  margin-top: 20px;
  cursor: pointer;
`;
const Chat = styled.div`
  width: 40px;
  height: 40px;
  background-image: url("/src/assets/chatIcon.png");
  background-size: 100% 100%;
  margin-top: 20px;
  cursor: pointer;
`;

const History = styled.div`
  width: 30px;
  height: 30px;
  background-image: url("/src/assets/recordsIcon.png");
  background-size: 100% 100%;
  margin-top: 25px;
  cursor: pointer;
`;

const Setting = styled.div`
  width: 40px;
  height: 40px;
  background-image: url("/src/assets/settingIcon.png");
  background-size: 100% 100%;
  margin-bottom: 20px;
  cursor: pointer;
`;

const NavContainer = styled.nav`
  width: 100%;
  height: 510px;
  background: var(--sub-bg-color);
  border-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
`;

const MenuContainer = styled.div`
  width: 70px;
  height: 95%;
  margin-left: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
`;

export default Menu;
