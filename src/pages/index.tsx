import Head from 'next/head'

// import { api } from '~/utils/api'
import { useState } from 'react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Combobox } from '@headlessui/react'

import { promises as fs } from 'fs'
import path from 'path'

function classNames(...classes: (string | boolean | undefined | null)[]) {
	return classes.filter(Boolean).join(' ')
}

type Document = {
	filename: string
	content: string
}

type DocumentOption = {
	id: number
	name: string
}

type ChunkedDocument = {
	filename: string
	chunks: Chunk[]
}

type Chunk = {
	chunk: string
	original_text: string
}

interface Props {
	documents: Document[]
	naives: ChunkedDocument[]
	ours: ChunkedDocument[]
}

function Home({ documents, naives, ours }: Props) {
	// const hello = api.post.hello.useQuery({ text: 'from tRPC' })

	const [query, setQuery] = useState('')
	const [selectedDocument, setSelectedDocument] = useState<DocumentOption | null>(null)
	const [naiveChunks, setNaiveChunks] = useState<Chunk[] | null>([])
	const [ourChunks, setOurChunks] = useState<Chunk[] | null>([])

	const documentList: DocumentOption[] = documents
		.filter((document) =>
			ours.find(
				({ filename }) =>
					filename.substring(0, filename.lastIndexOf('.')) ===
					document.filename.substring(0, filename.lastIndexOf('.'))
			)
		)
		.map(({ filename }, index) => {
			return {
				id: index,
				name: filename.substring(0, filename.lastIndexOf('.')),
			}
		})

	console.log(`🔴 Props`, { documents, naives })

	const filteredDocuments =
		query === ''
			? documentList
			: documentList.filter((document) => {
					return document.name.toLowerCase().includes(query.toLowerCase())
			  })

	const getDocumentContent = (documentName: string) => {
		// ! HACK: ALL FILES ARE TXT
		const documentNameWithExtension = documentName + '.txt'

		return documents.find((document) => document.filename === documentNameWithExtension)?.content
	}

	const handleClick = (documentName: string | undefined) => {
		if (!documentName) return

		const documentNameWithExtension = documentName + '.json'

		const naiveChunks = naives.find((naive) => naive.filename === documentNameWithExtension)?.chunks

		const ourChunks = ours.find((our) => our.filename === documentNameWithExtension)?.chunks

		console.log(`🟣 Generating Chunks:`, { naiveChunks, ourChunks })

		setNaiveChunks(naiveChunks ?? null)
		setOurChunks(ourChunks ?? null)
	}

	return (
		<>
			<Head>
				<title>Semantic Chunking</title>
				<meta name='description' content='Tools For Thought Hackathon at AGI House' />
				{/* <link rel="icon" href="/favicon.ico" /> */}
			</Head>
			<main className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#02376d] to-[#151a2c]'>
				<div className='container flex flex-col items-center gap-16 rounded-lg bg-white px-16 py-16'>
					<div className='grid w-full grid-cols-2 gap-16'>
						<div className='flex flex-col gap-2'>
							<h1 className='text-3xl font-extrabold tracking-tight'>Documents</h1>
							<Combobox as='div' value={selectedDocument} onChange={setSelectedDocument}>
								<div className='relative mt-2 max-w-sm'>
									<Combobox.Input
										className='w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
										onChange={(event) => setQuery(event.target.value)}
										displayValue={(document: DocumentOption) => document?.name}
									/>
									<Combobox.Button className='absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none'>
										<ChevronUpDownIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
									</Combobox.Button>

									{filteredDocuments.length > 0 && (
										<Combobox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
											{filteredDocuments.map((document) => (
												<Combobox.Option
													key={document.id}
													value={document}
													className={({ active }) =>
														classNames(
															'relative cursor-default select-none py-2 pl-3 pr-9',
															active ? 'bg-indigo-600' : 'text-gray-900'
														)
													}
												>
													{({ active, selected }) => (
														<>
															<span
																className={classNames(
																	'block truncate',
																	selected && 'font-semibold'
																)}
															>
																{document.name}
															</span>

															{selected && (
																<span
																	className={classNames(
																		'absolute inset-y-0 right-0 flex items-center pr-4',
																		active ? '' : 'text-indigo-600'
																	)}
																>
																	<CheckIcon className='h-5 w-5' aria-hidden='true' />
																</span>
															)}
														</>
													)}
												</Combobox.Option>
											))}
										</Combobox.Options>
									)}
								</div>
							</Combobox>
							<button
								type='button'
								className='mb-6 ml-6 mt-auto max-w-xs rounded-md bg-indigo-600 px-3.5 py-2.5 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
								onClick={() => handleClick(selectedDocument?.name)}
							>
								Generate Chunks
							</button>
						</div>
						<div className='flex flex-col gap-4'>
							<h1 className='text-3xl font-extrabold tracking-tight'>Preview</h1>
							<p className='h-96 overflow-y-scroll border border-gray-300 bg-gray-100 p-4'>
								{/* HACK: RE-ADDING FILE EXTENSION HERE */}
								{!!selectedDocument && getDocumentContent(selectedDocument.name)}
							</p>
						</div>
					</div>
					<div className='w-full border-t border-gray-300' />
					<div className='grid w-full grid-cols-2 gap-16'>
						<div className='flex flex-col gap-8'>
							<h1 className='text-3xl font-extrabold tracking-tight'>Naive Algo</h1>
							{naiveChunks?.map(({ original_text }) => (
								<div className='flex w-full gap-4'>
									<p className='border border-gray-300 bg-gray-50 p-4'>{original_text}</p>
									{/* <p className='w-80 p-4'>{`Chunk score = ${0.6}`}</p> */}
								</div>
							))}
						</div>
						<div className='flex flex-col gap-2'>
							<h1 className='text-3xl font-extrabold tracking-tight'>Our Algo</h1>
							{ourChunks?.map(({ original_text }) => (
								<div className='flex w-full gap-4'>
									<p className='border border-gray-300 bg-gray-50 p-4'>{original_text}</p>
									{/* <p className='w-80 p-4'>{`Chunk score = ${0.6}`}</p> */}
								</div>
							))}
						</div>
					</div>
				</div>
			</main>
		</>
	)
}

// https://nextjs.org/docs/pages/api-reference/functions/get-static-props#reading-files-use-processcwd
export async function getStaticProps() {
	const documentsDirectory = path.join(process.cwd(), 'src/data/raw_text')
	const documentFilenames = await fs.readdir(documentsDirectory)

	const documents = documentFilenames.map(async (filename) => {
		const filePath = path.join(documentsDirectory, filename)
		const fileContents = await fs.readFile(filePath, 'utf8')

		return {
			filename,
			content: fileContents,
		}
	})

	const naiveDirectory = path.join(process.cwd(), 'src/data/naive')
	const naiveFilenames = await fs.readdir(naiveDirectory)

	const naive = naiveFilenames.map(async (filename) => {
		const filePath = path.join(naiveDirectory, filename)
		const fileContents = await fs.readFile(filePath, 'utf8')

		const { chunks }: { chunks: { chunk: string; original_text: string }[] } =
			JSON.parse(fileContents)

		return {
			filename,
			chunks,
		}
	})

	const ourDirectory = path.join(process.cwd(), 'src/data/ours')
	const ourFilenames = await fs.readdir(ourDirectory)

	const ours = ourFilenames.map(async (filename) => {
		const filePath = path.join(ourDirectory, filename)
		const fileContents = await fs.readFile(filePath, 'utf8')

		const { chunks }: { chunks: { chunk: string; original_text: string }[] } =
			JSON.parse(fileContents)

		return {
			filename,
			chunks,
		}
	})

	return {
		props: {
			documents: await Promise.all(documents),
			naives: await Promise.all(naive),
			ours: await Promise.all(ours),
		},
	}
}

export default Home

{
	/* <p className='text-2xl'>{hello.data ? hello.data.greeting : 'Loading tRPC query...'}</p> */
}
