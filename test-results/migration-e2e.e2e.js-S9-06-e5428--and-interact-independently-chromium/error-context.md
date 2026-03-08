# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - heading "Modal Component (S9-01)" [level=2] [ref=e3]
    - paragraph [ref=e4]: "Click the button to open the modal. Test: focus trap, Escape key, backdrop click."
    - generic [ref=e5]:
      - button "Open Modal" [ref=e6] [cursor=pointer]
      - dialog [ref=e7]:
        - generic [ref=e8]:
          - generic [ref=e11]: Modal Title
          - paragraph [ref=e14]: This is a modal using the native <dialog> element.
          - button "Action" [active] [ref=e17]
  - generic [ref=e18]:
    - heading "Dropdown Component (S9-02)" [level=2] [ref=e19]
    - paragraph [ref=e20]: "Click the button to toggle the dropdown. Test: Popover API, light-dismiss (click outside)."
    - button [ref=e24] [cursor=pointer]:
      - generic [ref=e25]: ▾
  - generic [ref=e26]:
    - heading "Tooltip Component (S9-03)" [level=2] [ref=e27]
    - paragraph [ref=e28]: "Hover over the triggers. Test: Anchor Positioning, position auto-flip at viewport edges."
    - generic [ref=e29]:
      - tooltip "Hover me (top)" [ref=e31]:
        - generic [ref=e33]: Hover me (top)
      - tooltip "Hover me (bottom)" [ref=e35]:
        - generic [ref=e37]: Hover me (bottom)
      - tooltip "Hover me (left)" [ref=e39]:
        - generic [ref=e41]: Hover me (left)
      - tooltip "Hover me (right)" [ref=e43]:
        - generic [ref=e45]: Hover me (right)
  - generic [ref=e46]:
    - heading "Notification Component (S9-04)" [level=2] [ref=e47]
    - paragraph [ref=e48]: "Click to show notifications. Test: autodismiss (5s), hover pause, manual dismiss."
    - generic [ref=e49]:
      - button "Show Autodismiss Notification" [ref=e50] [cursor=pointer]
      - button "Show Dismissible Notification" [ref=e51] [cursor=pointer]
```