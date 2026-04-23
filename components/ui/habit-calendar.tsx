import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { getDayStatuses, DayStatus } from '../../src/utils/streaks';
import { Entry, Habit } from '../../src/models/types';

export type CalendarMode = 'week' | 'month' | 'year';

interface HabitCalendarProps {
  entries: Entry[];
  habit: Habit;
  mode: CalendarMode;
}

const DAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Monday-first day index (0=Mon … 6=Sun)
function mondayIndex(date: Date): number {
  const d = date.getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getMondayOfWeek(date: Date): Date {
  const diff = mondayIndex(date);
  return startOfDay(addDays(date, -diff));
}

// ─── Cell colour ────────────────────────────────────────────────────────────

function useStatusColor(status: DayStatus | 'future' | 'empty', primaryColor: string, borderColor: string) {
  switch (status) {
    case 'complete': return primaryColor;
    case 'partial':  return primaryColor + '66'; // ~40 % opacity
    case 'missed':   return borderColor;
    case 'future':   return 'transparent';
    case 'empty':    return 'transparent';
  }
}

// ─── Week view ───────────────────────────────────────────────────────────────

function WeekView({ dayMap }: { dayMap: Map<string, DayStatus> }) {
  const { theme } = useTheme();
  const today = startOfDay(new Date());
  const monday = getMondayOfWeek(today);

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    const key = toDateKey(date);
    const isFuture = date > today;
    const status: DayStatus | 'future' = isFuture ? 'future' : (dayMap.get(key) ?? 'missed');
    return { date, key, status, isToday: toDateKey(date) === toDateKey(today) };
  });

  return (
    <View style={weekStyles.row}>
      {days.map(({ date, key, status, isToday }) => (
        <View key={key} style={weekStyles.cell}>
          <Text style={[weekStyles.dayLetter, { color: isToday ? theme.colors.primary : theme.colors.textSecondary }]}>
            {DAY_INITIALS[mondayIndex(date)]}
          </Text>
          <DotCell status={status} size={28} />
          <Text style={[weekStyles.dayNum, { color: isToday ? theme.colors.primary : theme.colors.textSecondary }]}>
            {date.getDate()}
          </Text>
        </View>
      ))}
    </View>
  );
}

const weekStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  cell: { alignItems: 'center', gap: 4 },
  dayLetter: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  dayNum: { fontSize: 11 },
});

// ─── Month view ──────────────────────────────────────────────────────────────

function MonthView({ dayMap }: { dayMap: Map<string, DayStatus> }) {
  const { theme } = useTheme();
  const today = startOfDay(new Date());
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const startOffset = mondayIndex(firstOfMonth); // blank cells before day 1

  const cells: Array<{ date: Date | null; status: DayStatus | 'future' | 'empty' }> = [];

  for (let i = 0; i < startOffset; i++) cells.push({ date: null, status: 'empty' });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(today.getFullYear(), today.getMonth(), d);
    const key = toDateKey(date);
    const isFuture = date > today;
    cells.push({ date, status: isFuture ? 'future' : (dayMap.get(key) ?? 'missed') });
  }

  const monthName = MONTH_ABBR[today.getMonth()];

  return (
    <View>
      <Text style={[monthStyles.title, { color: theme.colors.text }]}>
        {monthName} {today.getFullYear()}
      </Text>
      <View style={monthStyles.headerRow}>
        {DAY_INITIALS.map((l, i) => (
          <Text key={i} style={[monthStyles.headerCell, { color: theme.colors.textSecondary }]}>{l}</Text>
        ))}
      </View>
      <View style={monthStyles.grid}>
        {cells.map((cell, i) => {
          if (!cell.date) return <View key={`blank-${i}`} style={monthStyles.blankCell} />;
          const isToday = toDateKey(cell.date) === toDateKey(today);
          return (
            <View key={toDateKey(cell.date)} style={monthStyles.cellWrap}>
              <DotCell status={cell.status} size={28} ring={isToday} />
              <Text style={[monthStyles.dayNum, { color: isToday ? theme.colors.primary : theme.colors.textSecondary }]}>
                {cell.date.getDate()}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const monthStyles = StyleSheet.create({
  title: { fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 6 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  headerCell: { width: 28, textAlign: 'center', fontSize: 11, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  blankCell: { width: 28, height: 40, margin: 4 },
  cellWrap: { width: 28, alignItems: 'center', margin: 4 },
  dayNum: { fontSize: 10, marginTop: 2 },
});

// ─── Year view (GitHub-style) ────────────────────────────────────────────────

function YearView({ dayMap }: { dayMap: Map<string, DayStatus> }) {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const today = startOfDay(new Date());
  const yearAgo = addDays(today, -364);

  // Align to the Monday on or before yearAgo
  const startMonday = getMondayOfWeek(yearAgo);

  // Build weeks: array of 7-day arrays (Mon–Sun)
  type Cell = { key: string; status: DayStatus | 'future' | 'empty' };
  const weeks: Cell[][] = [];
  let cursor = startMonday;
  while (cursor <= today) {
    const week: Cell[] = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(cursor, i);
      const key = toDateKey(d);
      const isFuture = d > today;
      const isBeforeStart = d < yearAgo;
      week.push({
        key,
        status: isBeforeStart || isFuture ? 'empty' : (dayMap.get(key) ?? 'missed'),
      });
    }
    weeks.push(week);
    cursor = addDays(cursor, 7);
  }

  const PADDING = 32;
  const GAP = 2;
  const numWeeks = weeks.length;
  const cellSize = Math.floor((screenWidth - PADDING - GAP * (numWeeks - 1)) / numWeeks);
  const clampedSize = Math.min(Math.max(cellSize, 4), 12);

  // Month labels: collect first week index where a new month starts
  const monthLabels: Array<{ weekIdx: number; label: string }> = [];
  weeks.forEach((week, wi) => {
    const firstNonEmpty = week.find(c => c.status !== 'empty');
    if (!firstNonEmpty) return;
    const d = new Date(firstNonEmpty.key);
    if (d.getDate() <= 7) {
      const prev = wi > 0 ? new Date(weeks[wi - 1].find(c => c.status !== 'empty')?.key ?? '') : null;
      if (!prev || prev.getMonth() !== d.getMonth()) {
        monthLabels.push({ weekIdx: wi, label: MONTH_ABBR[d.getMonth()] });
      }
    }
  });

  return (
    <View>
      {/* Month labels row */}
      <View style={[yearStyles.monthRow, { gap: GAP }]}>
        {weeks.map((_, wi) => {
          const label = monthLabels.find(ml => ml.weekIdx === wi);
          return (
            <View key={wi} style={{ width: clampedSize }}>
              {label ? (
                <Text style={[yearStyles.monthLabel, { color: theme.colors.textSecondary, fontSize: Math.max(clampedSize - 2, 6) }]}>
                  {label.label}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>

      {/* Grid */}
      <View style={[yearStyles.grid, { gap: GAP }]}>
        {weeks.map((week, wi) => (
          <View key={wi} style={[yearStyles.weekCol, { gap: GAP }]}>
            {week.map((cell) => (
              <YearCell key={cell.key} status={cell.status} size={clampedSize} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function YearCell({ status, size }: { status: DayStatus | 'future' | 'empty'; size: number }) {
  const { theme } = useTheme();
  const color = useStatusColor(status, theme.colors.primary, theme.colors.border);
  const isEmpty = status === 'empty' || status === 'future';
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: Math.max(1, size / 4),
      backgroundColor: isEmpty ? 'transparent' : color,
      borderWidth: isEmpty ? 0 : 0,
    }} />
  );
}

const yearStyles = StyleSheet.create({
  monthRow: { flexDirection: 'row', marginBottom: 2 },
  monthLabel: { fontWeight: '500' },
  grid: { flexDirection: 'row' },
  weekCol: { flexDirection: 'column' },
});

// ─── Shared dot cell ─────────────────────────────────────────────────────────

function DotCell({ status, size, ring }: { status: DayStatus | 'future' | 'empty'; size: number; ring?: boolean }) {
  const { theme } = useTheme();
  const color = useStatusColor(status, theme.colors.primary, theme.colors.border);
  const isFutureOrEmpty = status === 'future' || status === 'empty';

  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: isFutureOrEmpty ? 'transparent' : color,
      borderWidth: ring ? 2 : isFutureOrEmpty ? 1 : 0,
      borderColor: ring ? theme.colors.primary : theme.colors.border,
      borderStyle: isFutureOrEmpty && !ring ? 'dashed' : 'solid',
    }} />
  );
}

// ─── Mode label ───────────────────────────────────────────────────────────────

function ModeLabel({ mode }: { mode: CalendarMode }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const modes: CalendarMode[] = ['week', 'month', 'year'];

  return (
    <View style={labelStyles.row}>
      {modes.map((m) => (
        <Text
          key={m}
          style={[
            labelStyles.label,
            { color: m === mode ? theme.colors.primary : theme.colors.textSecondary },
          ]}
        >
          {t(`history.calendar.${m}`)}
        </Text>
      ))}
    </View>
  );
}

const labelStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
});

// ─── Public component ─────────────────────────────────────────────────────────

export function HabitCalendar({ entries, habit, mode }: HabitCalendarProps) {
  const { theme } = useTheme();
  const dayMap = useMemo(() => getDayStatuses(entries, habit), [entries, habit]);

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
      <ModeLabel mode={mode} />
      {mode === 'week' && <WeekView dayMap={dayMap} />}
      {mode === 'month' && <MonthView dayMap={dayMap} />}
      {mode === 'year' && <YearView dayMap={dayMap} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
});
