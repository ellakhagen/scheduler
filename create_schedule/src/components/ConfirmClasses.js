import {Box, Button, Text, Drawer, DrawerBody,
DrawerHeader, DrawerOverlay, DrawerContent, Input, Table, Thead, Tbody, Tr, 
Th, Td, Checkbox, HStack} from '@chakra-ui/react'
import {useState, useEffect} from 'react'
 
function ConfirmClasses({isOpen, onClose, classFile, setClasses, generatedClassFile, term, 
    yourClasses, setYourClasses}){
    const [file, setFile] = useState({});
    const [courseFilter, setCourseFilter] = useState('')
    const [professorFilter, setProfessorFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5


    function handleCourseFilterChange(event){
        setCourseFilter(event.target.value)
        setCurrentPage(1)
    }
    function handleProfessorFilterChange(event){
        setProfessorFilter(event.target.value);
        setCurrentPage(1)
    };
    function handleCheckboxChange(courseCode){
       const rowData = file[courseCode]
       setYourClasses((prev) => {
        if(prev[courseCode]){
        const {[courseCode]: removed, ...rest} = prev;
        return rest
        }
        else{
            return{
                ...prev,
                [courseCode] : rowData
            }
        }
       })
    }

    const filteredData = Object.keys(file).filter(courseCode => 
    courseCode.toUpperCase().includes(courseFilter.toUpperCase()) &&
    file[courseCode].course_instructor.some(instructor => 
        instructor.toUpperCase().includes(professorFilter.toUpperCase()))
    )
    .reduce((obj, courseCode) => {
        obj[courseCode] = file[courseCode];
        return obj;
    }, {});
 
    const totalPages = Math.ceil(Object.keys(filteredData).length / itemsPerPage)
    const paginatedData = Object.keys(filteredData).slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    ).reduce((obj, courseCode) => {
        obj[courseCode] = filteredData[courseCode]
        return obj;
    }, {});

    function handlePreviousPage(){
        setCurrentPage((prev) => Math.max(prev-1, 1));
    }

    function handleNextPage(){
        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    }


    useEffect(() => {
        if(classFile){
            setFile(classFile)
        }
        else if(generatedClassFile){
            setFile(generatedClassFile)
        }
    }, [classFile, generatedClassFile])
    
        function handleContinue(){
            onClose()
            setClasses(true)
        }
    
    return(
        <Drawer placement='bottom' onClose={onClose} isOpen={isOpen}>
            <DrawerOverlay />
            <DrawerContent p='40px'>
                <DrawerHeader pb='0px' pl='0' display='flex' justifyContent='space-between'>
                    <Text fontSize='30px'>Confirm Classes</Text>
                    <Button onClick={handleContinue} bg='#ECECEC'>
                        <Text textColor='#626161'>Continue</Text>
                    </Button>
                </DrawerHeader>
                <DrawerHeader borderBottomWidth='1px' textColor='#626161' pt='0px' pl='0px'>Please confirm your classes for {term}</DrawerHeader>
                <DrawerBody pl='0px'>
                    <Box h='550px'>
                        <Input placeholder='Search by course code' value={courseFilter}
                        onChange={handleCourseFilterChange} mb='16px'></Input>
                        <Input placeholder='Search by instructor' value={professorFilter}
                        onChange={handleProfessorFilterChange} mb='16px'></Input>
                        <Table variant='simple' style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <Thead>
                                <Tr>
                                    <Th w='5%'></Th>
                                    <Th w='10%'>Course Code</Th>
                                    <Th w='30%'>Course Name</Th>
                                    <Th w='10%'>Course Number</Th>
                                    <Th w='10%'>Course Day</Th>
                                    <Th w='10%'>Course End</Th>
                                    <Th w='10%'>Course Start</Th>
                                    <Th w='15%'>Course Instructor</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {Object.keys(paginatedData).map(courseCode => {
                                    const { course_name, course_number, course_day, course_start, 
                                        course_end, course_instructor } = paginatedData[courseCode];
                                    return (
                                        <Tr key={courseCode} >
                                            <Td w='5%'>
                                                <Checkbox isChecked={!!(yourClasses ?? {})[courseCode]}
                                                onChange={()=> handleCheckboxChange(courseCode)}/>
                                            </Td>
                                            <Td w='10%'>{courseCode}</Td>
                                            <Td w='30%'>{course_name}</Td>
                                            <Td w='10%'>{course_number}</Td>
                                            <Td w='10%'>{course_day}</Td>
                                            <Td w='10%'>{course_start}</Td>
                                            <Td w='10%'>{course_end}</Td>
                                            <Td w='15%'>{course_instructor}</Td>
                                        </Tr>
                                    );
                                })}
                            </Tbody>
                        </Table>
                        <HStack spacing='4' justifyContent='center' mt='4' position='absolute' bottom='30px' 
                        left='50%' transform="translateX(-50%)">
                            <Button onClick={handlePreviousPage} isDisabled={currentPage === 1}>Previous</Button>
                            <Text>Page {currentPage} of {totalPages}</Text>
                            <Button onClick={handleNextPage} isDisabled={currentPage === totalPages}>Next</Button>
                        </HStack>
                    </Box>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    )
}

export default ConfirmClasses;