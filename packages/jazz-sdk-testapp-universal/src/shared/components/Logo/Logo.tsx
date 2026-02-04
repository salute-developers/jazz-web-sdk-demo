import styled from 'styled-components/macro';

const Root = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: baseline;
  gap: 8px;
`;

// Компонент для текста с градиентом
const GradientText = styled.span`
  background: linear-gradient(145deg, rgb(191, 107, 242) 0%, #2a72f8 100%) text;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.05em;
  padding: 0 2px;
`;

const SubText = styled.span`
  color: #7683a4;
  font-size: 0.92em;
`;

export const Logo: React.FC<{
  logoText: string;
  subText: string;
}> = ({ logoText, subText }): JSX.Element => (
  <Root>
    <GradientText>{logoText}</GradientText>
    <SubText>{subText}</SubText>
  </Root>
);
