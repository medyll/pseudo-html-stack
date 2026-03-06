# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - heading "S10 Form & Layout Component Tests" [level=1] [ref=e2]
  - generic [ref=e3]:
    - 'heading "S10-01: Input Validation" [level=2] [ref=e4]'
    - generic [ref=e5]:
      - textbox "Required field" [ref=e7]
      - textbox "Email" [ref=e9]
      - spinbutton [ref=e11]
      - button "Submit" [ref=e12]
  - generic [ref=e13]:
    - 'heading "S10-03: Checkbox & Radio" [level=2] [ref=e14]'
    - generic [ref=e15]:
      - generic [ref=e16]:
        - checkbox "I agree to terms" [ref=e17] [cursor=pointer]
        - generic [ref=e18]: I agree to terms
      - group "Choose one:" [ref=e19]:
        - generic [ref=e20]: "Choose one:"
        - generic [ref=e21]:
          - radio "Option A" [ref=e22] [cursor=pointer]
          - generic [ref=e23]: Option A
        - generic [ref=e24]:
          - radio "Option B" [ref=e25] [cursor=pointer]
          - generic [ref=e26]: Option B
  - generic [ref=e27]:
    - 'heading "S10-05: Grid Layout" [level=2] [ref=e28]'
    - generic [ref=e29]:
      - generic [ref=e30]: Item 1
      - generic [ref=e31]: Item 2
      - generic [ref=e32]: Item 3
      - generic [ref=e33]: Item 4
      - generic [ref=e34]: Item 5
      - generic [ref=e35]: Item 6
```