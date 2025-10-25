# Event Analytics Dashboard - Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Spring Concert 2025                                  │
│                     Event Analytics Dashboard                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Tickets Issued   │  │ Checked In       │  │ Pending Check-in │  │ Venue Capacity   │
│ ════════════════ │  │ ════════════════ │  │ ════════════════ │  │ ════════════════ │
│                  │  │                  │  │                  │  │                  │
│      150         │  │      120         │  │       30         │  │      200         │
│                  │  │   80% attendance │  │                  │  │  50 remaining    │
└──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘
  [BLUE BORDER]        [GREEN BORDER]        [YELLOW BORDER]       [PURPLE BORDER]


┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│ Check-in Progress                    │  │ Capacity Utilization                 │
│                                      │  │                                      │
│ Checked In vs Issued           80.0% │  │ Tickets vs Capacity           75.0%  │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░                │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░                │
│ 120 of 150 tickets checked in        │  │ 150 of 200 capacity used             │
└──────────────────────────────────────┘  └──────────────────────────────────────┘
  [GREEN PROGRESS BAR]                     [BLUE PROGRESS BAR]


┌─────────────────────────────────────────────────────────────────────────────┐
│                              Event Summary                                   │
├─────────────────────────────────────────────┬───────────────────────────────┤
│ Total Tickets Issued                        │ 150                           │
├─────────────────────────────────────────────┼───────────────────────────────┤
│ Tickets Checked In                          │ 120                           │
├─────────────────────────────────────────────┼───────────────────────────────┤
│ Pending Check-in                            │ 30                            │
├─────────────────────────────────────────────┼───────────────────────────────┤
│ Venue Capacity                              │ 200                           │
├─────────────────────────────────────────────┼───────────────────────────────┤
│ Remaining Capacity                          │ 50                            │
├─────────────────────────────────────────────┼───────────────────────────────┤
│ Check-in Rate                               │ 80.0%                         │
├─────────────────────────────────────────────┼───────────────────────────────┤
│ Capacity Utilization                        │ 75.0%                         │
└─────────────────────────────────────────────┴───────────────────────────────┘


                         ┌──────────────────────┐
                         │  Refresh Analytics   │
                         └──────────────────────┘
                           [BLUE BUTTON]
```

## Color Scheme

### Metric Cards
- **Tickets Issued**: Blue (#3B82F6) - Information/Primary
- **Checked In**: Green (#10B981) - Success/Active
- **Pending Check-in**: Yellow (#F59E0B) - Warning/Attention
- **Venue Capacity**: Purple (#8B5CF6) - Neutral/Capacity

### Progress Bars
- **Check-in Progress**: Green (#10B981) - Shows attendance
- **Capacity Utilization**: 
  - Blue (<70%): Plenty of space
  - Yellow (70-90%): Getting full
  - Red (>90%): Near capacity

## Responsive Breakpoints

### Mobile (< 768px)
```
┌────────────────┐
│ Tickets Issued │
│      150       │
└────────────────┘

┌────────────────┐
│ Checked In     │
│      120       │
└────────────────┘

┌────────────────┐
│ Pending        │
│       30       │
└────────────────┘

┌────────────────┐
│ Venue Capacity │
│      200       │
└────────────────┘

┌────────────────────────┐
│ Check-in Progress      │
│ ▓▓▓▓▓▓▓▓░░             │
└────────────────────────┘

┌────────────────────────┐
│ Capacity Utilization   │
│ ▓▓▓▓▓▓▓░░              │
└────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌──────────────┐  ┌──────────────┐
│ Tickets      │  │ Checked In   │
│    150       │  │    120       │
└──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐
│ Pending      │  │ Capacity     │
│     30       │  │    200       │
└──────────────┘  └──────────────┘

┌──────────────────────────────────┐
│ Check-in Progress                │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Capacity Utilization             │
└──────────────────────────────────┘
```

### Desktop (> 1024px)
Full layout as shown at the top.

## Interactive States

### Loading State
```
┌─────────────────────────────────────┐
│                                     │
│         Loading analytics...        │
│               ⏳                     │
│                                     │
└─────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────┐
│                                     │
│    ⚠️  Error: Failed to fetch       │
│         analytics data              │
│                                     │
│      [Retry Button]                 │
└─────────────────────────────────────┘
```

### Hover States
- Cards: Slight shadow increase on hover
- Refresh button: Darker blue background
- Progress bars: Slight glow effect

## Future Enhancements Visualization

### With Charts (Phase 2)
```
┌──────────────────┐  ┌──────────────────────────────┐
│ Tickets Issued   │  │   Check-in Timeline          │
│      150         │  │        ┌─┐                   │
└──────────────────┘  │      ┌─┤ │                   │
                      │    ┌─┤ │ │                   │
┌──────────────────┐  │  ┌─┤ │ │ │                   │
│ Checked In       │  │  │ │ │ │ │                   │
│      120         │  │  └─┴─┴─┴─┴─                  │
└──────────────────┘  │  9a 10a 11a 12p 1p           │
                      └──────────────────────────────┘

┌──────────────────────────────────────────────────┐
│         Attendance Distribution                   │
│              ╱╲                                   │
│            ╱    ╲                                 │
│          ╱        ╲                               │
│        ╱            ╲                             │
│      ╱                ╲___                        │
│    ╱                       ╲___                   │
│  ╱─────────────────────────────╲                 │
│  Check-in  Peak    Late                          │
└──────────────────────────────────────────────────┘
```

### With Demographic Breakdown (Phase 3)
```
┌──────────────────────────────────────┐
│ Attendee Demographics                │
│                                      │
│ Students:    ████████████ 60%       │
│ Faculty:     ████ 20%               │
│ Staff:       ███ 15%                │
│ Guests:      █ 5%                   │
└──────────────────────────────────────┘
```

---

This visual guide shows exactly how the dashboard will look when implemented!
