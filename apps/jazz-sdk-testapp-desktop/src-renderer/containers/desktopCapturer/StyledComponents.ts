import { Button, Caption, Headline3, Modal } from '@salutejs/plasma-b2c';
import { dark01, surfaceCard } from '@salutejs/plasma-tokens';
import styled from 'styled-components/macro';

export const Container = styled(Modal)`
  width: auto;

  > div {
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    padding: 24px;
    width: 420px;
  }
`;

export const Title = styled(Headline3)`
  text-align: center;
`;

export const SSourcesWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(186px, 1fr));

  overflow-y: scroll;
`;

export const ImgWrapper = styled.div`
  width: 170px;
  height: 96px;
  border-radius: 8px;
  overflow: hidden;
  background-color: ${surfaceCard};
  box-sizing: border-box;
  object-fit: contain;
  display: flex;
  align-items: center;
  justify-content: space-around;
  img {
    width: 170px;
    height: 96px;
  }

  &:hover {
    opacity: 1;
  }
`;
export const SSourceItem = styled.div<{ 'data-selected'?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  opacity: 0.7;
  cursor: pointer;

  &[data-selected],
  &:hover {
    opacity: 1;

    img {
      box-shadow: 0 0 0 2px white;
    }
  }
`;

export const SSourceText = styled(Caption)`
  width: 170px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-top: 4px;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
`;

export const Buttons = styled.div`
  display: flex;
`;

export const Action = styled(Button)`
  margin-left: 8px;
  white-space: nowrap;
`;

export const Video = styled.video`
  pointer-events: none;
  height: 100%;
  object-fit: cover;
  width: 100%;
  display: block;
  background: ${dark01};
`;
