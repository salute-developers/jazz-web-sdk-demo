import React, { FC, MouseEvent, useEffect, useState } from 'react';

import { getVideoEffectsService } from '@salutejs/jazz-sdk-web-plugins';
import {
  Body2,
  BodyS,
  BodyXS,
  Button,
  IconButton,
  Switch,
  Upload,
} from '@salutejs/plasma-b2c';
import { IconBlockOutline, IconTrashFill } from '@salutejs/plasma-icons';
import {
  textAccent,
  textPrimary,
  textSecondary,
} from '@salutejs/plasma-themes/tokens';
import styled, { css } from 'styled-components/macro';

import { useSDKContext } from '../../shared/contexts/sdkContext';
import { booleanAttribute } from '../../shared/utils/dataAttributes';

import { RoundLensBlurIcon, UploadImageIcon } from './assets';
import Image1 from './assets/image1.jpeg';
import Image2 from './assets/image2.jpeg';
import { VirtualBackgroundImage, VirtualBackgroundSetting } from './types';

const Title = styled(Body2)`
  margin-bottom: 16px;
`;

const acceptExtensions = '.jpg,.jpeg,.png,.webp';

const BackgroundList = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  overflow-x: scroll;
  padding-bottom: 10px;
`;

const TrashButton = styled(IconButton).attrs({
  view: 'secondary',
  pin: 'circle-circle',
  size: 's',
  contentLeft: <IconTrashFill size="s" />,
})`
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1;
`;

const CardButton = styled(Button)<{
  'data-selected'?: boolean;
  'data-border-hover'?: boolean;
}>`
  box-sizing: border-box;

  height: 97px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;

  &:last-child {
    margin-right: 0;
  }

  ${TrashButton} {
    display: none;
  }

  &:hover {
    ${TrashButton} {
      display: flex;
    }
  }

  &[data-selected],
  &[data-border-hover]:hover {
    &::after {
      content: '';

      display: block;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;

      box-sizing: border-box;
      border-radius: 8px;
      border: 2px solid ${textAccent};

      user-select: none;
    }
  }
`;

const ImageCard = styled(CardButton).attrs({
  'data-border-hover': true,
})`
  flex: 1 0 155px;
  overflow: hidden;
`;

const UploadButton = styled(CardButton)`
  padding: 0;
`;

const ButtonContent = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  justify-content: center;
  color: ${textPrimary};
`;

const cardButtonStyle = css`
  width: 24px;
  height: 24px;
  margin-bottom: 8px;
`;

const CancelButtonIcon = styled(IconBlockOutline)`
  ${cardButtonStyle}
`;

const BlurButtonIcon = styled(RoundLensBlurIcon)`
  ${cardButtonStyle}
`;

const UploadButtonIcon = styled(UploadImageIcon)`
  ${cardButtonStyle}
`;

const ButtonCaption = styled(BodyS)`
  color: ${textPrimary};
  white-space: nowrap;
`;

const ButtonSubtitle = styled(BodyXS)`
  margin-top: 2px;
  color: ${textSecondary};
`;

const BackgroundImage = styled.img`
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  height: 100%;
  width: 100%;
  object-fit: cover;
`;

const StyledUpload = styled(Upload)`
  & > div.file-drop {
    height: 100%;

    & > div.file-drop-target {
      height: 100%;

      & > button {
        height: 100%;
        transform: none;
        border: 0;
        opacity: 1;
        background: transparent;
      }
    }
  }
`;

const getImageBitmap = async (image: VirtualBackgroundImage) => {
  if (image.type === 'url') {
    try {
      const response = await fetch(image.url);
      if (!response.ok) {
        console.error(
          `Failed to download a background image: ${response.status}`,
        );
        return undefined;
      }

      const blob = await response.blob();
      const imageBitmap = await createImageBitmap(blob);

      return imageBitmap;
    } catch (error) {
      console.error(`Failed to create an image bitmap`, error);
      return undefined;
    }
  }

  const imageBitmap = createImageBitmap(image.blob);

  return imageBitmap;
};

export const VirtualBackgrounds: FC = () => {
  const { sdk } = useSDKContext();

  const videoEffectService = getVideoEffectsService(sdk);
  // Активный режим
  const [settings, setSettings] = useState<VirtualBackgroundSetting>({
    background: { mode: 'disabled' },
    autoWhiteBalance: false,
    autoGammaCorrection: false,
    autoColorCorrection: false,
    faceBeautification: false,
    smartFocus: false,
  });

  // Список изображений
  const [images, setImages] = useState<VirtualBackgroundImage[]>([
    {
      type: 'url',
      url: Image1,
      imageId: '1',
    },
    {
      type: 'url',
      url: Image2,
      imageId: '2',
    },
  ]);

  const setOption = (
    key: keyof VirtualBackgroundSetting,
    option: VirtualBackgroundSetting[typeof key],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: option }));
  };

  const uploadImageFile = async (file: File): Promise<void> => {
    const previewUrl = URL.createObjectURL(file);
    const imageId = `${Date.now()}`;
    setImages((prev) => [
      ...prev,
      { imageId: imageId, type: 'blob', blob: file, url: previewUrl },
    ]);
    setOption('background', { imageId, mode: 'image' });
  };

  const deleteBackgroundImage = async (imageId: string): Promise<void> => {
    const image = images.find((image) => image.imageId === imageId);
    if (!image) {
      return;
    }

    if (
      settings.background.mode === 'image' &&
      settings.background.imageId === image.imageId
    ) {
      setOption('background', { mode: 'disabled' });
    }

    setImages((prev) => prev.filter((elem) => elem.imageId !== image.imageId));
  };

  const selectBlurBackground = () => {
    setOption('background', { mode: 'blur' });
  };

  const disableBackground = () => {
    setOption('background', { mode: 'disabled' });
  };

  const selectBackgroundImage = (image: VirtualBackgroundImage) => {
    setOption('background', { mode: 'image', imageId: image.imageId });
  };

  const selectedImageId =
    settings.background.mode === 'image'
      ? settings.background.imageId
      : undefined;
  const selectedImage = images.find(
    (image) => image.imageId === selectedImageId,
  );

  const [allowScrollToSelectedImage, setScrollToSelectedImage] =
    useState(false);

  useEffect(() => {
    const { background, ...restOptions } = settings;
    if (background.mode === 'blur') {
      videoEffectService.setEffects({
        backgroundReplacement: 'blur',
      });
    }
    if (background.mode === 'disabled') {
      videoEffectService.setEffects({
        backgroundReplacement: undefined,
      });
    }
    videoEffectService.setEffects(restOptions);
  }, [settings, videoEffectService]);

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    getImageBitmap(selectedImage).then((imageBitmap) => {
      videoEffectService.setEffects({
        backgroundReplacement: imageBitmap,
      });
    });
  }, [selectedImage, videoEffectService]);

  useEffect(() => () => setScrollToSelectedImage(true), [selectedImageId]);

  useEffect(() => {
    if (allowScrollToSelectedImage && selectedImageId) {
      const element = document.querySelector(
        `#virtualBackgroundImage-${selectedImageId}`,
      );
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allowScrollToSelectedImage, selectedImageId, images]);

  function onTrashButtonClick(event: MouseEvent<HTMLElement>, imageId: string) {
    event.stopPropagation();
    deleteBackgroundImage(imageId);
  }

  return (
    <>
      <Title>Select video effects</Title>

      <BackgroundList>
        <CardButton
          view="secondary"
          data-testid="withoutBackground"
          onClick={disableBackground}
          data-selected={booleanAttribute(
            settings.background.mode === 'disabled',
          )}
        >
          <ButtonContent>
            <CancelButtonIcon />

            <ButtonCaption>Without background</ButtonCaption>
          </ButtonContent>
        </CardButton>

        <CardButton
          view="secondary"
          data-testid="blurBackground"
          onClick={selectBlurBackground}
          data-selected={booleanAttribute(settings.background.mode === 'blur')}
        >
          <ButtonContent>
            <BlurButtonIcon />

            <ButtonCaption>Blur</ButtonCaption>
          </ButtonContent>
        </CardButton>

        <UploadButton view="secondary" data-testid="uploadBackground">
          <StyledUpload
            accept={acceptExtensions}
            onChange={(file) => uploadImageFile(file)}
            content={
              <ButtonContent>
                <UploadButtonIcon />

                <ButtonCaption>Upload yours</ButtonCaption>
                <ButtonSubtitle>Jpg, png, webp</ButtonSubtitle>
              </ButtonContent>
            }
          />
        </UploadButton>

        {images.map((image) => {
          return (
            <ImageCard
              id={`virtualBackgroundImage-${image.imageId}`}
              key={image.imageId}
              data-selected={booleanAttribute(
                selectedImageId === image.imageId,
              )}
              onClick={() => selectBackgroundImage(image)}
            >
              <BackgroundImage src={image.url} alt={image.imageId} />

              <TrashButton
                data-testid="deleteBackgroundButton"
                onClick={(event) => onTrashButtonClick(event, image.imageId)}
              />
            </ImageCard>
          );
        })}
      </BackgroundList>
      {(
        [
          'autoColorCorrection',
          'faceBeautification',
          'autoWhiteBalance',
          'autoGammaCorrection',
          'smartFocus',
        ] as const
      ).map((option) => (
        <Switch
          key={option}
          label={option}
          onChange={() => setOption(option, !settings[option])}
          checked={settings[option]}
        />
      ))}
    </>
  );
};
