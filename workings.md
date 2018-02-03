1. on init for each package
```
{
  "name": "libc6",
  "size": 3824342,
  "version": "8710",
  "conflicts": ["libc6<8710", "nscd<8640", "tzdata<11664", "tzdata-etch"],
  "depends": [
    ["libc-bin=8710"],
    ["libgcc1"]
  ]
}
```

2. get of the deps and sub all deps

```
 {
  "name": "libc-bin",
  "size": 317918,
  "version": "8708",
  "conflicts": ["libc-bin<8708", "libc0.1<8687", "libc0.3<8687", "libc6<8687", "libc6.1<8687"],
  "depends": []
}
{
  "name": "libgcc1",
  "size": 17182,
  "version": "12992",
  "conflicts": ["libgcc1<12992"],
  "depends": [
    ["gcc-4.4-base=10443"],
    ["libc6>=7922"]
  ]
}
{
  "name": "gcc-4.4-base",
  "size": 903776,
  "version": "10443",
  "conflicts": ["gcc-4.4-base<10443"],
  "depends": []
}
```

3. need to resolve the optional deps on init

```

```