import { Collapse, Dropdown, Input, Navbar, Pagination } from "@nextui-org/react";
import { useDebounceEffect } from 'ahooks';
import 'babel-polyfill';
import { useEffect, useMemo, useState } from 'react';
import { Bookmark, Search } from 'react-iconly';
import { Box } from '../components/layout/Box';
import { itemsPerPage } from '../lib/global';
import { HIssue } from './HIssue';

export const HList = (data) => {
    const [listData, setListData] = useState()
    const [searchValue, setSearchValue] = useState('')
    const [labels, setLabels] = useState()
    // eslint-disable-next-line no-undef
    const [selected, setSelected] = useState(new Set(['ALL']))
    const [pageTotal, setPageTotal] = useState(0)

    const selectedValue = useMemo(
        () => Array.from(selected).join(", ").replaceAll("_", " "),
        [selected]
    );

    useDebounceEffect(() => {
        if (!searchValue && selected.has('ALL')) {
            setListData(data.data)
            return
        }
        // if (listData) {
        const filterred = data.data.filter(issue => {
            var regex = new RegExp(searchValue, "i")
            return issue['title'].search(regex) > -1 || issue['body'].search(regex) > -1
        })
        const filteredArray = filterred.filter(value => {
            var ret = value['labels.name'].filter(x => selected.has(x.toUpperCase()) || selected.has('ALL'))
            var len = ret.length
            return len > 0
        });
        setListData(filteredArray)
        // }

    }, [searchValue, selected], { wait: 2000 })

    useEffect(() => {
        if (!listData) {
            setPageTotal(0)
        } else {
            var count = Object.keys(listData).length
            if (count === 0) {
                setPageTotal(0)
            } else {
                setPageTotal(count / itemsPerPage + 1)
            }
        }

    }, [listData])

    useEffect(() => {
        if (data.header) {
            var menuItems = []
            data.header.forEach((item) => {
                menuItems.push({ key: item.toUpperCase(), value: item })
            })
            menuItems.push({ key: 'ALL', value: 'all' })
            setLabels(menuItems)
        }
        if (data.data) {
            setListData(data.data)
        }
    }, [data])

    return (
        <Box>
            <Navbar isBordered variant="sticky">
                <Navbar.Brand css={{ mr: "$4" }}>
                    <Dropdown placement="bottom-right">
                        <Dropdown.Button light>
                            <Bookmark size='medium' />
                            {selectedValue}
                        </Dropdown.Button>
                        <Dropdown.Menu
                            aria-label="Blog Labels"
                            color="secondary" items={labels}
                            disallowEmptySelection
                            selectionMode="multiple"
                            selectedKeys={selected}
                            onSelectionChange={setSelected}
                        >
                            {(item) => (
                                <Dropdown.Item withDivider={item.key === 'ALL'} key={item.key}>{item.value}</Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                </Navbar.Brand>
                <Navbar.Content
                    css={{
                        "@xsMax": {
                            w: "100%",
                            jc: "space-between",
                        },
                    }}
                >
                    {pageTotal > 0 &&
                        <Navbar.Item css={{
                            "@xsMax": {
                                w: "100%",
                                jc: "center",
                            },
                        }}>

                            <Pagination aria-label="pagination" noMargin shadow total={pageTotal} initialPage={1} />

                        </Navbar.Item>
                    }
                    <Navbar.Item
                        css={{
                            "@xsMax": {
                                w: "100%",
                                jc: "center",
                            },
                        }}
                    >
                        <Input
                            clearable
                            aria-label="search"
                            value={searchValue}
                            onChange={e => setSearchValue(e.target.value)}
                            contentLeft={
                                <Search fill="var(--nextui-colors-accents6)" size={16} />
                            }
                            contentLeftStyling={false}
                            css={{
                                w: "100%",
                                "@xsMax": {
                                    mw: "300px",
                                },
                                "& .nextui-input-content--left": {
                                    h: "100%",
                                    ml: "$4",
                                    dflex: "center",
                                },
                            }}
                            placeholder="Search..."
                        />
                    </Navbar.Item>
                </Navbar.Content>
            </Navbar>

            <Collapse.Group key='Issues'>
                {listData &&
                    listData.map((issue) => (
                        <HIssue title={issue.title} key={issue.updated_at} issue={issue} />
                    ))
                }
            </Collapse.Group>
        </Box>
    )
}