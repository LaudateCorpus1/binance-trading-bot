/* eslint-disable global-require */

describe('symbol-setting-delete.test.js', () => {
  let mockWebSocketServer;
  let mockWebSocketServerWebSocketSend;

  let mockLogger;

  let mockDeleteSymbolConfiguration;

  let mockQueue;

  beforeEach(() => {
    jest.clearAllMocks().resetModules();

    mockWebSocketServerWebSocketSend = jest.fn().mockResolvedValue(true);

    mockWebSocketServer = {
      send: mockWebSocketServerWebSocketSend
    };

    mockQueue = {
      executeFor: jest.fn().mockResolvedValue(true)
    };

    jest.mock('../../../../cronjob/trailingTradeHelper/queue', () => mockQueue);
  });

  describe('when symbol is provided', () => {
    beforeEach(async () => {
      const { logger } = require('../../../../helpers');
      mockLogger = logger;
      mockLogger.fields = { correlationId: 'correlationId' };

      mockDeleteSymbolConfiguration = jest.fn().mockResolvedValue(true);

      jest.mock(
        '../../../../cronjob/trailingTradeHelper/configuration',
        () => ({
          deleteSymbolConfiguration: mockDeleteSymbolConfiguration
        })
      );

      const { handleSymbolSettingDelete } = require('../symbol-setting-delete');
      await handleSymbolSettingDelete(logger, mockWebSocketServer, {
        data: {
          symbol: 'BTCUSDT'
        }
      });
    });

    it('triggers deleteSymbolConfiguration', () => {
      expect(mockDeleteSymbolConfiguration).toHaveBeenCalledWith(
        mockLogger,
        'BTCUSDT'
      );
    });

    it('triggers queue.executeFor', () => {
      expect(mockQueue.executeFor).toHaveBeenCalledWith(mockLogger, 'BTCUSDT', {
        correlationId: 'correlationId'
      });
    });

    it('triggers ws.send', () => {
      expect(mockWebSocketServerWebSocketSend).toHaveBeenCalledWith(
        JSON.stringify({
          result: true,
          type: 'symbol-setting-delete-result'
        })
      );
    });
  });
});
