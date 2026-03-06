# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - heading "Modal Component (S9-01)" [level=2] [ref=e3]
    - paragraph [ref=e4]: "Click the button to open the modal. Test: focus trap, Escape key, backdrop click."
    - button "Open Modal" [ref=e6] [cursor=pointer]
  - generic [ref=e7]:
    - heading "Dropdown Component (S9-02)" [level=2] [ref=e8]
    - paragraph [ref=e9]: "Click the button to toggle the dropdown. Test: Popover API, light-dismiss (click outside)."
    - button [active] [ref=e13] [cursor=pointer]:
      - generic [ref=e14]: ▾
  - generic [ref=e15]:
    - heading "Tooltip Component (S9-03)" [level=2] [ref=e16]
    - paragraph [ref=e17]: "Hover over the triggers. Test: Anchor Positioning, position auto-flip at viewport edges."
    - generic [ref=e18]:
      - tooltip "Hover me (top)" [ref=e20]:
        - generic [ref=e22]: Hover me (top)
      - tooltip "Hover me (bottom)" [ref=e24]:
        - generic [ref=e26]: Hover me (bottom)
      - tooltip "Hover me (left)" [ref=e28]:
        - generic [ref=e30]: Hover me (left)
      - tooltip "Hover me (right)" [ref=e32]:
        - generic [ref=e34]: Hover me (right)
  - generic [ref=e35]:
    - heading "Notification Component (S9-04)" [level=2] [ref=e36]
    - paragraph [ref=e37]: "Click to show notifications. Test: autodismiss (5s), hover pause, manual dismiss."
    - generic [ref=e38]:
      - button "Show Autodismiss Notification" [ref=e39] [cursor=pointer]
      - button "Show Dismissible Notification" [ref=e40] [cursor=pointer]
```