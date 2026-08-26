jest.mock("react-native/Libraries/Utilities/Platform", () => {
  const platform = {
    OS: "android",
    select: (options: Record<string, unknown>) => options.android,
  };
  return { __esModule: true, default: platform, ...platform };
});

const mockRequestWidgetUpdate = jest.fn();
jest.mock("react-native-android-widget", () => ({
  requestWidgetUpdate: (...args: unknown[]) => mockRequestWidgetUpdate(...args),
}));

const mockResolveInboxWidgetRepresentation = jest.fn();
jest.mock("../inbox/inboxWidgetRender", () => ({
  resolveInboxWidgetRepresentation: (...args: unknown[]) =>
    mockResolveInboxWidgetRepresentation(...args),
}));

jest.mock("../capture/captureWidgetRender", () => ({
  resolveCaptureWidgetRepresentation: jest.fn(),
}));

import { refreshInboxWidgets } from "../update";

describe("refreshInboxWidgets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requests an Inbox update using the inbox resolver", async () => {
    const representation = { kind: "inbox" };
    mockResolveInboxWidgetRepresentation.mockResolvedValue(representation);

    refreshInboxWidgets();

    expect(mockRequestWidgetUpdate).toHaveBeenCalledWith({
      widgetName: "Inbox",
      renderWidget: expect.any(Function),
    });
    const renderWidget = mockRequestWidgetUpdate.mock.calls[0][0].renderWidget;
    await expect(
      renderWidget({ widgetId: 42, width: 320, height: 180 })
    ).resolves.toBe(representation);
    expect(mockResolveInboxWidgetRepresentation).toHaveBeenCalledWith(
      42,
      320,
      180
    );
  });
});
