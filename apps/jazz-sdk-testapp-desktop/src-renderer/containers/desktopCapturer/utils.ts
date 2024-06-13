export type VideoPool = {
  releaseAll: () => void;
  releaseVideoStream: (sourceId: string) => void;
  getVideoStream: (params: { sourceId: string }) => Promise<MediaStream>;
};

export function createVideoPool(): VideoPool {
  const mediaStreamPool = new Map<string, MediaStream>();

  const releaseAll = () => {
    mediaStreamPool.forEach((stream) => {
      stream.getTracks().forEach(function (track) {
        track.stop();
      });
    });

    mediaStreamPool.clear();
  };

  const releaseVideoStream = (sourceId: string) => {
    const stream = mediaStreamPool.get(sourceId);
    if (!stream) {
      return;
    }
    mediaStreamPool.delete(sourceId);

    stream.getTracks().forEach(function (track) {
      track.stop();
    });
  };

  const getVideoStream = async (params: {
    sourceId: string;
  }): Promise<MediaStream> => {
    const { sourceId } = params;

    if (mediaStreamPool.has(sourceId)) {
      return mediaStreamPool.get(sourceId) as MediaStream;
    }

    // create MediaStream
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId,
          minWidth: 320,
          maxWidth: 320,
          minHeight: 240,
          maxHeight: 240,
          minFrameRate: 5,
          maxFrameRate: 5,
        },
      },
    });

    mediaStreamPool.set(sourceId, stream);

    return stream;
  };

  return {
    getVideoStream,
    releaseAll,
    releaseVideoStream,
  };
}
