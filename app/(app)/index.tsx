import * as Haptics from "expo-haptics";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
  type Href,
} from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import Sortable from "react-native-sortables";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandLogo } from "../../src/components/brand/BrandLogo";
import { UserAvatar } from "../../src/components/brand/UserAvatar";
import { CaptureBar } from "../../src/components/inbox/CaptureBar";
import { EmptyState } from "../../src/components/inbox/EmptyState";
import { InboxFilter } from "../../src/components/inbox/InboxFilter";
import { ItemRow } from "../../src/components/inbox/ItemRow";
import { OfflineBanner } from "../../src/components/inbox/OfflineBanner";
import { SearchBar } from "../../src/components/inbox/SearchBar";
import { SwipeDeleteRow } from "../../src/components/inbox/SwipeDeleteRow";
import { inboxEmptyVariant } from "../../src/components/inbox/emptyStateCopy";
import { AppIcon } from "../../src/components/ui/AppIcon";
import { AppModal } from "../../src/components/ui/AppModal";
import { ModalActionRow } from "../../src/components/ui/ModalActionRow";
import { SkeletonBlock } from "../../src/components/ui/SkeletonBlock";
import { INBOX_SKELETON_WIDTHS } from "../../src/components/ui/inboxSkeletonPresentation";
import { useAuth } from "../../src/features/auth/AuthProvider";
import { getAvatarPresentation } from "../../src/features/auth/avatarPresentation";
import { useInboxSelection } from "../../src/hooks/useInboxSelection";
import { useItems } from "../../src/hooks/useItems";
import { useOnline } from "../../src/hooks/useOnline";
import { itemMatchesQuery } from "../../src/lib/inboxSearch";
import {
  deleteConfirmTitle,
  selectionCountLabel,
  shouldEnterSelectionFromDrag,
} from "../../src/lib/inboxSelection";
import {
  parseInboxWidgetParams,
  shouldDismissAfterWidgetCapture,
  shouldDismissOnInboxBack,
} from "../../src/lib/inboxWidgetEntry";
import { font, fontSize, iconSize, lineHeight, spacing, touchTarget } from "../../src/lib/theme";
import { useTheme } from "../../src/lib/themeContext";
import type { InboxFilter as Filter, Item, ItemType } from "../../src/types/item";
import { dismissToLauncher } from "../../src/widgets/dismissToLauncher";

type ConfirmTarget =
  | null
  | { kind: "one"; itemId: string }
  | { kind: "many" };

function sameItemIds(a: Item[], b: Item[]): boolean {
  return a.length === b.length && a.every((item, i) => item.id === b[i]?.id);
}

function InboxLoadingSkeleton() {
  return (
    <View style={styles.skeletonList} accessibilityLabel="Carregando">
      {INBOX_SKELETON_WIDTHS.map((width) => (
        <View key={width} style={styles.skeletonRow}>
          <SkeletonBlock width={width} height={lineHeight.title} />
        </View>
      ))}
    </View>
  );
}

export default function InboxScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const {
    items,
    loading,
    error,
    saveError,
    create,
    toggleDone,
    reorder,
    remove,
    removeMany,
  } = useItems();
  const online = useOnline();
  const router = useRouter();
  const params = useLocalSearchParams();
  const entry = parseInboxWidgetParams(
    params as Record<string, string | string[] | undefined>
  );
  const {
    mode: selectionMode,
    selectedIds,
    selectedSet,
    enter: enterSelection,
    toggle: toggleSelection,
    clear: clearSelection,
    prune: pruneSelection,
    removeIds: removeSelectionIds,
  } = useInboxSelection();
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const [deleting, setDeleting] = useState(false);
  const [fromWidget, setFromWidget] = useState(entry.fromWidget);
  const [prevFromWidgetParam, setPrevFromWidgetParam] = useState(
    entry.fromWidget
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [searchMode, setSearchMode] = useState(false);
  const [query, setQuery] = useState("");
  const scrollableRef = useAnimatedRef<Animated.ScrollView>();

  if (entry.fromWidget !== prevFromWidgetParam) {
    setPrevFromWidgetParam(entry.fromWidget);
    if (entry.fromWidget) setFromWidget(true);
  }
  if (selectionMode && searchMode) {
    setSearchMode(false);
    setQuery("");
  }
  if (entry.focusCapture && !loading && searchMode) {
    setSearchMode(false);
    setQuery("");
  }

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (searchMode) {
        setSearchMode(false);
        setQuery("");
        return true;
      }
      if (!shouldDismissOnInboxBack(fromWidget)) return false;
      dismissToLauncher();
      return true;
    });
    return () => sub.remove();
  }, [fromWidget, searchMode]);

  const clearWidgetMode = useCallback(() => setFromWidget(false), []);

  const exitSearch = useCallback(() => {
    setSearchMode(false);
    setQuery("");
  }, []);

  const avatar = getAvatarPresentation({
    photoURL: user?.photoURL ?? null,
    displayName: user?.displayName ?? null,
    email: user?.email ?? null,
  });

  const visible = useMemo(() => {
    const byType =
      filter === "notes"
        ? items.filter((i) => i.type === "note")
        : filter === "tasks"
          ? items.filter((i) => i.type === "task")
          : items;
    if (!searchMode) return byType;
    return byType.filter((i) => itemMatchesQuery(i, query));
  }, [items, filter, searchMode, query]);

  const [listDataHold, setListDataHold] = useState<Item[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const listData = listDataHold ?? visible;

  if (!isDragging && listDataHold && sameItemIds(visible, listDataHold)) {
    setListDataHold(null);
  } else if (
    !isDragging &&
    listDataHold &&
    visible.length !== listDataHold.length
  ) {
    setListDataHold(null);
  }

  useEffect(() => {
    pruneSelection(visible.map((i) => i.id));
  }, [visible, pruneSelection]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        clearSelection();
        setConfirmTarget(null);
      };
    }, [clearSelection])
  );

  const handleCapture = async (type: ItemType, title: string) => {
    await create(type, title);
    if (shouldDismissAfterWidgetCapture(fromWidget)) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      dismissToLauncher();
    }
  };

  const handleToggleDone = useCallback(
    async (itemId: string, done: boolean) => {
      if (!online) return;
      await toggleDone(itemId, done);
    },
    [online, toggleDone]
  );

  const handleFilterChange = useCallback(
    (next: Filter) => {
      clearSelection();
      setFilter(next);
    },
    [clearSelection]
  );

  const openItem = useCallback(
    (item: Item) => {
      clearWidgetMode();
      router.push({
        pathname: "/item/[id]",
        params: {
          id: item.id,
          ...(item.color ? { color: item.color } : {}),
        },
      } as Href);
    },
    [router, clearWidgetMode]
  );

  const renderItem = useCallback(
    ({ item }: { item: Item }) => (
      <SwipeDeleteRow
        enabled={online && !selectionMode}
        onRequestDelete={() => {
          if (!online) return;
          setConfirmTarget({ kind: "one", itemId: item.id });
        }}
      >
        <ItemRow
          item={item}
          selectionMode={selectionMode}
          selected={selectedSet.has(item.id)}
          onPress={() => {
            if (selectionMode) toggleSelection(item.id);
            else openItem(item);
          }}
          onToggleDone={(done) => handleToggleDone(item.id, done)}
        />
      </SwipeDeleteRow>
    ),
    [
      handleToggleDone,
      online,
      openItem,
      selectionMode,
      selectedSet,
      toggleSelection,
    ]
  );

  const handleDragEnd = useCallback(
    async ({
      data,
      fromIndex,
      toIndex,
    }: {
      data: Item[];
      fromIndex: number;
      toIndex: number;
    }) => {
      setIsDragging(false);
      setListDataHold(data);
      if (shouldEnterSelectionFromDrag(fromIndex, toIndex)) {
        const held = data[fromIndex];
        if (held) enterSelection(held.id);
        return;
      }
      if (!online) {
        setListDataHold(null);
        return;
      }
      const moved = data[toIndex];
      if (!moved) return;
      try {
        await reorder(moved.id, data);
      } catch {
        setListDataHold(null);
      }
    },
    [enterSelection, online, reorder]
  );

  const confirmTitle = useMemo(() => {
    if (!confirmTarget) return "";
    if (confirmTarget.kind === "many") {
      return deleteConfirmTitle({
        kind: "many",
        count: selectedIds.length,
      });
    }
    const item = items.find((i) => i.id === confirmTarget.itemId);
    return deleteConfirmTitle({
      kind: "one",
      type: item?.type === "task" ? "task" : "note",
      title: item?.title ?? "",
    });
  }, [confirmTarget, items, selectedIds.length]);

  const handleConfirmDelete = async () => {
    if (!online || !confirmTarget || deleting) return;
    setDeleting(true);
    try {
      if (confirmTarget.kind === "one") {
        await remove(confirmTarget.itemId);
      } else {
        const { deleted } = await removeMany(selectedIds);
        if (deleted.length === selectedIds.length) {
          clearSelection();
        } else {
          removeSelectionIds(deleted);
        }
      }
      setConfirmTarget(null);
    } catch {
      // saveError set by hook
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseConfirm = () => {
    if (deleting) return;
    setConfirmTarget(null);
  };

  const showEmpty = !loading && !error && listData.length === 0;
  const showSkeleton = loading && !error && listData.length === 0;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.chrome}>
        <View style={styles.header}>
          {selectionMode ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancelar"
                onPress={() => clearSelection()}
                hitSlop={spacing.sm}
                style={styles.headerTextButton}
              >
                <Text style={[styles.headerAction, { color: colors.brand }]}>
                  Cancelar
                </Text>
              </Pressable>
              <Text
                style={[styles.headerCount, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {selectionCountLabel(selectedIds.length)}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Excluir"
                disabled={
                  !online || selectedIds.length === 0 || deleting
                }
                onPress={() => {
                  if (!online || selectedIds.length === 0) return;
                  setConfirmTarget({ kind: "many" });
                }}
                hitSlop={spacing.sm}
                style={styles.headerTextButton}
              >
                <Text
                  style={[
                    styles.headerAction,
                    {
                      color:
                        !online || selectedIds.length === 0
                          ? colors.textSecondary
                          : colors.danger,
                    },
                  ]}
                >
                  Excluir
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <BrandLogo height={28} />
              <View style={styles.headerActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={searchMode ? "Fechar busca" : "Buscar"}
                  onPress={() => {
                    if (searchMode) exitSearch();
                    else setSearchMode(true);
                  }}
                  hitSlop={spacing.sm}
                  style={styles.avatarButton}
                >
                  <AppIcon
                    name="search"
                    size={iconSize.md}
                    color={colors.brand}
                  />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Configurações"
                  onPress={() => {
                    clearSelection();
                    clearWidgetMode();
                    router.push("/settings" as Href);
                  }}
                  hitSlop={spacing.sm}
                  style={styles.avatarButton}
                >
                  <UserAvatar
                    uri={avatar.uri}
                    initial={avatar.initial}
                    size={32}
                    accessible={false}
                  />
                </Pressable>
              </View>
            </>
          )}
        </View>

        {!online ? <OfflineBanner /> : null}

        <InboxFilter value={filter} onChange={handleFilterChange} />
        {searchMode ? (
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClose={exitSearch}
          />
        ) : (
          <CaptureBar
            onSubmit={handleCapture}
            disabled={!online || selectionMode}
            autoFocus={Boolean(entry.focusCapture && !loading)}
          />
        )}

        {error ? (
          <Text style={{ fontFamily: font.regular, color: colors.danger }}>
            Não foi possível carregar. Verifique a conexão.
          </Text>
        ) : saveError ? (
          <Text style={{ fontFamily: font.regular, color: colors.danger }}>
            {saveError}
          </Text>
        ) : null}
      </View>

      <Animated.ScrollView
        ref={scrollableRef}
        style={styles.listContainer}
        contentContainerStyle={[styles.list, showEmpty && styles.listEmpty]}
        keyboardShouldPersistTaps="handled"
      >
        {showSkeleton ? (
          <InboxLoadingSkeleton />
        ) : showEmpty ? (
          <EmptyState variant={inboxEmptyVariant(searchMode, query)} />
        ) : (
          <Sortable.Grid
            columns={1}
            data={listData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            rowGap={spacing.sm}
            sortEnabled={online && !selectionMode && !searchMode}
            dragActivationDelay={220}
            activationAnimationDuration={180}
            dropAnimationDuration={220}
            activeItemScale={1.03}
            activeItemOpacity={1}
            activeItemShadowOpacity={0}
            inactiveItemOpacity={0.72}
            inactiveItemScale={1}
            enableActiveItemSnap={false}
            overDrag="vertical"
            scrollableRef={scrollableRef}
            onDragStart={() => {
              setListDataHold(visible);
              setIsDragging(true);
            }}
            onDragEnd={handleDragEnd}
          />
        )}
      </Animated.ScrollView>

      <AppModal
        visible={confirmTarget !== null}
        title={confirmTitle}
        onClose={handleCloseConfirm}
        actions={
          <ModalActionRow
            confirmLabel="Excluir"
            variant="danger"
            busy={deleting}
            onCancel={handleCloseConfirm}
            onConfirm={() => {
              void handleConfirmDelete();
            }}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  chrome: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 44,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTextButton: {
    minHeight: touchTarget,
    justifyContent: "center",
  },
  headerAction: {
    fontFamily: font.medium,
    fontSize: fontSize.body,
  },
  headerCount: {
    fontFamily: font.medium,
    fontSize: fontSize.meta,
    flex: 1,
    textAlign: "center",
    paddingHorizontal: spacing.sm,
  },
  avatarButton: {
    minWidth: touchTarget,
    minHeight: touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  listContainer: { flex: 1 },
  list: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  skeletonList: {
    gap: spacing.sm,
  },
  skeletonRow: {
    minHeight: touchTarget,
    justifyContent: "center",
  },
  listEmpty: { flexGrow: 1, justifyContent: "center" },
});
