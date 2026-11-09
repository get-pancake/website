"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { DEFAULT_COUNTRY_LIST, resolveCountry, searchCountries } from "../../lib/white-glove/country-search";
import { COMMON_COUNTRIES, type Country } from "../../lib/white-glove/countries";

/**
 * The form's country field: a searchable list in place of the native
 * <select>, whose macOS menu could not be scrolled back up through 250
 * countries (Tristan, 2026-11-08). Type to filter ("fra", "uk", "usa"), or
 * scroll the list, which the page draws itself; the most common countries
 * come first. ARIA 1.2 combobox with a listbox popup.
 *
 * `value` is always a country of the list or "": typing changes it only when
 * the text names a country exactly, and leaving the field keeps the last
 * country picked, or the only match.
 */

/** Scroll the list (never the page) so this option shows. */
function keepInView(list: HTMLElement | null, index: number, center = false) {
  const el = list?.querySelector<HTMLElement>(`[data-index="${index}"]`);
  if (!list || !el) return;
  if (center) {
    list.scrollTop = el.offsetTop - list.clientHeight / 2 + el.offsetHeight / 2;
    return;
  }
  if (el.offsetTop < list.scrollTop) list.scrollTop = el.offsetTop;
  else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) {
    list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight;
  }
}

export function WgCountryField({
  id,
  value,
  onChange,
  invalid,
  describedBy,
  placeholder,
  emptyText,
  listLabel,
}: {
  id: string;
  value: string;
  onChange: (country: Country | "") => void;
  invalid?: boolean;
  describedBy?: string;
  placeholder: string;
  emptyText: string;
  listLabel: string;
}) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  /** where the list fits: under the field, or over it near the bottom of the screen */
  const [placement, setPlacement] = useState<{ up: boolean; maxHeight: number }>({ up: false, maxHeight: 264 });
  const [searching, setSearching] = useState(false); // the list shows search results
  const [active, setActive] = useState(0);
  const options = searching ? searchCountries(query) : DEFAULT_COUNTRY_LIST;

  // The field shows the chosen country whenever it is not being edited.
  useEffect(() => {
    if (!open) setQuery(value);
  }, [value, open]);

  // The active option stays in view while the arrow keys move it.
  useEffect(() => {
    if (open) keepInView(listRef.current, active);
  }, [active, open]);

  const optionId = (index: number) => `${listId}-opt-${index}`;

  function openList() {
    if (open) return;
    const current = value ? DEFAULT_COUNTRY_LIST.indexOf(value as Country) : -1;
    const box = inputRef.current?.getBoundingClientRect();
    if (box) {
      const screen = window.visualViewport?.height ?? window.innerHeight;
      const below = screen - box.bottom - 12;
      const above = box.top - 12;
      const up = below < 200 && above > below;
      setPlacement({ up, maxHeight: Math.round(Math.max(140, Math.min(264, up ? above : below))) });
    }
    setSearching(false);
    setActive(Math.max(current, 0));
    setOpen(true);
    // typing replaces the country shown (after the click has placed the caret)
    window.setTimeout(() => inputRef.current?.select(), 0);
    // once drawn: the chosen country in the middle, or the top of the list
    requestAnimationFrame(() => {
      if (current >= 0) keepInView(listRef.current, current, true);
      else if (listRef.current) listRef.current.scrollTop = 0;
    });
  }

  function close() {
    setOpen(false);
    setSearching(false);
  }

  function choose(country: Country) {
    onChange(country);
    setQuery(country);
    close();
  }

  /** Leaving the field: an exact name or the only match is taken; anything else falls back. */
  function settle() {
    if (!open) return;
    const text = query.trim();
    const matches = searching ? searchCountries(text) : [];
    const pick = resolveCountry(text) ?? (matches.length === 1 ? matches[0]! : null);
    if (pick) {
      if (pick !== value) onChange(pick);
      setQuery(pick);
    } else if (!text) {
      if (value) onChange("");
      setQuery("");
    } else {
      setQuery(value);
    }
    close();
  }

  function move(e: KeyboardEvent<HTMLInputElement>, step: number) {
    e.preventDefault();
    if (!open) return openList();
    setActive((i) => Math.min(Math.max(i + step, 0), Math.max(options.length - 1, 0)));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") move(e, 1);
    else if (e.key === "ArrowUp") move(e, -1);
    else if (e.key === "PageDown") move(e, 8);
    else if (e.key === "PageUp") move(e, -8);
    else if (e.key === "Enter" && open) {
      e.preventDefault(); // picks a country instead of submitting the form
      const country = options[active];
      if (country) choose(country);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setQuery(value);
      close();
    }
  }

  return (
    <div className="wg-combo" data-open={open || undefined}>
      <input
        ref={inputRef}
        id={id}
        name="country-search"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && options[active] ? optionId(active) : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        // the browser's own address suggestions would open over this list
        autoComplete="off"
        autoCapitalize="words"
        spellCheck={false}
        required
        placeholder={placeholder}
        className="wg-field__input wg-combo__input"
        value={query}
        onFocus={openList}
        onMouseDown={openList}
        onBlur={settle}
        onKeyDown={onKeyDown}
        onChange={(e) => {
          const text = e.target.value;
          setQuery(text);
          const exact = resolveCountry(text);
          if (exact && exact !== value) onChange(exact);
          // a value set without the focus (an extension, a password manager): no list then
          if (document.activeElement !== e.target) return;
          setSearching(true);
          setActive(0);
          setOpen(true);
          if (listRef.current) listRef.current.scrollTop = 0;
        }}
      />
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label={listLabel}
        className="wg-combo__list"
        data-up={placement.up || undefined}
        style={{ maxHeight: placement.maxHeight }}
        hidden={!open}
        // the focus stays in the field while the list is clicked or its scrollbar dragged
        onMouseDown={(e) => e.preventDefault()}
      >
        {options.length ? (
          options.map((country, index) => (
            <li
              key={country}
              id={optionId(index)}
              data-index={index}
              role="option"
              aria-selected={country === value}
              className="wg-combo__option"
              data-active={index === active || undefined}
              data-last-common={(!searching && index === COMMON_COUNTRIES.length - 1) || undefined}
              onMouseMove={() => index !== active && setActive(index)}
              onClick={() => choose(country)}
            >
              {country}
            </li>
          ))
        ) : (
          <li className="wg-combo__empty" role="presentation">
            {emptyText}
          </li>
        )}
      </ul>
    </div>
  );
}
