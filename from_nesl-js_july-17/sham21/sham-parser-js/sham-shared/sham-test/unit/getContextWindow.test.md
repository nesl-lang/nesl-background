# Tests

## general

### 001-middle-of-large-file

```text
line 1
line 2
line 3
line 4
line 5
line 6
````

```text
3
```

```text
line 1
line 2
line 3
line 4
line 5
```

### 002-small-file-entire-window

```text
a
b
c
```

```text
2
```

```text
a
b
c
```

### 003-single-line-file

```text
only line
```

```text
1
```

```text
only line
```

### 004-exactly-five-lines

```text
line 1
line 2
line 3
line 4
line 5
```

```text
3
```

```text
line 1
line 2
line 3
line 4
line 5
```

### 005-near-end-of-file

```text
line 1
line 2
line 3
line 4
line 5
line 6
line 7
```

```text
6
```

```text
line 3
line 4
line 5
line 6
line 7
```

### 006-at-start-of-file

```text
line 1
line 2
line 3
line 4
line 5
line 6
line 7
```

```text
2
```

```text
line 1
line 2
line 3
line 4
line 5
```

### 007-four-line-file

```text
line 1
line 2
line 3
line 4
```

```text
3
```

```text
line 1
line 2
line 3
line 4
```

### 008-end-of-file-line-minus-0

```text
line 1
line 2
line 3
line 4
line 5
line 6
line 7
```

```text
7
```

```text
line 3
line 4
line 5
line 6
line 7
```

### 009-end-of-file-line-minus-1

```text
line 1
line 2
line 3
line 4
line 5
line 6
line 7
```

```text
6
```

```text
line 3
line 4
line 5
line 6
line 7
```

### 010-end-of-file-line-minus-2

```text
line 1
line 2
line 3
line 4
line 5
line 6
line 7
```

```text
5
```

```text
line 3
line 4
line 5
line 6
line 7
```

### 011-start-of-file-line-plus-2

```text
line 1
line 2
line 3
line 4
line 5
line 6
line 7
```

```text
3
```

```text
line 1
line 2
line 3
line 4
line 5
```

### 012-five-line-file-error-on-line-4

```text
line 1
line 2
line 3
line 4
line 5
```

```text
4
```

```text
line 1
line 2
line 3
line 4
line 5
```
