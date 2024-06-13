import React, { FC } from 'react';

import { JazzReactionType } from '@salutejs/jazz-sdk-web';
import styled from 'styled-components/macro';

const StyledReaction = styled.div`
  width: 24px;
  height: 24px;
  font-size: 24px;
  line-height: 24px;
  user-select: none;
`;

const mapping: Record<JazzReactionType, string> = {
  applause: '👏',
  like: '👍',
  dislike: '👎',
  smile: '😂',
  surprise: '😮',
};

interface ReactionProps {
  reaction: JazzReactionType;
}

export const Reaction: FC<ReactionProps> = ({ reaction }) => (
  <StyledReaction>{mapping[reaction]}</StyledReaction>
);
